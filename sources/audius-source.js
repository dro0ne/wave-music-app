(function(root){
  const API='https://api.audius.co/v1',allowed=t=>t.is_available!==false&&t.access?.stream!==false&&!t.stream_conditions&&!t.is_stream_gated&&!t.is_unlisted&&!t.is_delete&&!!t.track_cid,json=async(url,signal)=>{let response=await (root.WaveProxy?.fetch||fetch)(url,{signal});if(!response.ok)throw Object.assign(Error('Audius request failed'),{status:response.status});return response.json()},normalize=raw=>root.WaveTrackModel.normalizeTrack(raw,'audius');
  // Audius filters by exact genre name; an unknown name returns an error, so only these values are sent as genre=.
  const GENRES=['Electronic','Rock','Metal','Alternative','Hip-Hop/Rap','Experimental','Punk','Folk','Pop','Ambient','Soundtrack','World','Jazz','Acoustic','Funk','R&B/Soul','Devotional','Classical','Reggae','Podcasts','Country','Spoken Word','Comedy','Blues','Kids','Audiobooks','Latin','Lo-Fi','Hyperpop','Dancehall','Techno','Trap','House','Tech House','Deep House','Disco','Electro','Jungle','Progressive House','Hardstyle','Glitch Hop','Trance','Future Bass','Downtempo','Drum & Bass','Dubstep','Jersey Club','Vaporwave','Moombahton','Phonk'];
  const PARENT={hiphop:'Hip-Hop/Rap',pop:'Pop',rock:'Rock',indie:'Alternative',alternative:'Alternative',punk:'Punk',metal:'Metal',electronic:'Electronic',dance:'Electronic',rnb:'R&B/Soul',soul:'R&B/Soul',funk:'Funk',jazz:'Jazz',blues:'Blues',classical:'Classical',folk:'Folk',country:'Country',reggae:'Reggae',latin:'Latin',world:'World',lofi:'Lo-Fi',ambient:'Ambient',chill:'Downtempo',soundtrack:'Soundtrack',experimental:'Experimental',spoken:'Spoken Word',kids:'Kids'};
  const RUSSIAN_WORDS=['я','не','в','на','ты'];
  // Subgenres that have a closer Audius genre than their family.
  const NARROW={'gospel':'Devotional','acid house':'House','detroit techno':'Techno','minimal techno':'Techno','hardcore techno':'Techno','psytrance':'Trance'};
  // Styles that uploaders file under several Audius genres; each pair is an extra [genre, query] search.
  const EXTRA={'synthpop':[['Electronic','synthpop'],[null,'synth pop']],'emo':[['Punk','emo'],['Alternative','emo'],[null,'midwest emo']],'chamber music':[['Classical','chamber'],['Classical','string quartet']],'tango':[[null,'tango'],[null,'bandoneon']],'8 bit':[['Electronic','chiptune'],[null,'8 bit']],'chiptune':[['Electronic','8bit']],'drill':[['Hip-Hop/Rap','ukdrill'],[null,'uk drill']]};
  // Maps a UI genre label to {genre, query}: a direct Audius genre, or the parent genre plus a text query for the subgenre.
  function genreQuery(label){
    let clean=root.WaveGenre?.clean||(x=>String(x||'').toLowerCase().trim()),key=clean(label),query=baseQuery(label,key,clean);
    return EXTRA[key]?{...query,extra:EXTRA[key]}:query;
  }
  function baseQuery(label,key,clean){
    let direct=GENRES.find(x=>clean(x)===key);
    if(direct)return {genre:direct,query:''};
    if(NARROW[key])return {genre:NARROW[key],query:key.replace(/ /g,'')};
    let info=root.WaveGenre?.normalizeGenre(label),genre=PARENT[info?.normalizedGenre];
    // Audius has no language filter; short common Russian words find Cyrillic titles inside the genre.
    if(root.WaveGenre?.isLanguageLabel(label))return {genre:null,query:'',words:RUSSIAN_WORDS};
    if(info?.subgenres.includes('russian'))return {genre:'Hip-Hop/Rap',query:label,words:RUSSIAN_WORDS};
    // Tags on Audius are mostly written joined ("postrock"), and search finds far more tracks that way.
    return genre?{genre,query:info.subgenres.length?key.replace(/ /g,''):''}:{genre:null,query:label};
  }
  const page=async(url,signal)=>{let data=await json(url,signal);return data.data||[]},finish=(raw,received)=>{const tracks=raw.filter(allowed).map(normalize);tracks.pipeline={received,normalized:tracks.length};return tracks};
  root.WaveSources=root.WaveSources||{};root.WaveSources.audius={id:'audius',label:'Audius',genreQuery,
    async searchTracks(query,{signal,limit=24,offset=0}={}){const raw=await page(`${API}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,signal);return finish(raw,raw.length)},
    async getTracksByGenre(label,{signal,limit=24,offset=0}={}){
      let {genre,query,words,extra=[]}=genreQuery(label);if(!genre&&!words)return this.searchTracks(label,{signal,limit,offset});
      // A subgenre query is narrow, so the plain parent genre is fetched alongside it to keep the pool large enough.
      let requests=[...(words?[query,...words].filter(Boolean):[query,...(query?['']:[])]).map(q=>[genre,q]),...extra];
      let settled=await Promise.allSettled(requests.map(([g,q])=>page(`${API}/tracks/search?query=${encodeURIComponent(q)}${g?`&genre=${encodeURIComponent(g)}`:''}&limit=${limit}&offset=${offset}`,signal))),pages=settled.filter(x=>x.status==='fulfilled').map(x=>x.value);
      if(!pages.length)throw settled[0].reason;
      let raw=[...new Map(pages.flat().map(t=>[t.id,t])).values()];return finish(raw,Math.max(...pages.map(x=>x.length)))
    },
    async getTracksByMood(mood,label,{signal,limit=24,offset=0}={}){
      let moods=root.WaveMood?.tags?.[mood]?.match||[];if(!moods.length)return finish([],0);
      let {genre,query,words}=label?genreQuery(label):{genre:null,query:''},params=moods.map(x=>`&mood=${encodeURIComponent(x)}`).join('')+(genre?`&genre=${encodeURIComponent(genre)}`:'');
      let pages=await Promise.all((words?words.slice(0,2):[genre?'':query]).map(q=>page(`${API}/tracks/search?query=${encodeURIComponent(q)}${params}&limit=${limit}&offset=${offset}`,signal))),raw=[...new Map(pages.flat().map(t=>[t.id,t])).values()];return finish(raw,Math.max(...pages.map(x=>x.length)))
    },
    async getTrendingTracks({signal,limit=100,offset=0}={}){const raw=await page(`${API}/tracks/trending?limit=${limit}&offset=${offset}`,signal);return finish(raw,raw.length)},
    async getLatestTracks({signal,limit=100,offset=0}={}){const raw=await page(`${API}/tracks/latest?limit=${limit}&offset=${offset}`,signal);return finish(raw,raw.length)},
    async getStream(track,{signal}={}){let data=await json(`${API}/tracks/${encodeURIComponent(track.sourceTrackId)}/stream?no_redirect=true`,signal),url=data?.data;if(typeof url!=='string'||!/^https:\/\//i.test(url))throw Error('Audius stream URL missing');return {url}},normalizeTrack:normalize};
})(typeof window!=='undefined'?window:globalThis);
