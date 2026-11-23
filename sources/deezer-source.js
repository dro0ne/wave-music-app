(function(root){
  // Deezer's open catalogue API (no key): search, and genre charts for fresh popular music in the wave.
  // Deezer itself only lets apps play 30-second previews, so a Deezer track plays in full through another service:
  // Spotify by ISRC (exact recording), then YouTube by title. The preview is a last resort, only for tracks the
  // listener picked in search (never inside the wave).
  // api.deezer.com sends no CORS headers but supports JSONP (output=jsonp), so requests are <script> tags.
  let sequence=0;
  // Tracks the listener found in search may fall back to the preview; the player rebuilds track objects, so this is
  // remembered here by id (id → preview URL) instead of on the track.
  const searched=new Map();
  function jsonp(path,signal){
    return new Promise((resolve,reject)=>{
      const name=`__waveDeezer${++sequence}`,script=document.createElement('script');let settled=false;
      const finish=()=>{settled=true;script.remove();root[name]=()=>{};setTimeout(()=>{delete root[name]},60000)};
      root[name]=data=>{if(settled)return;finish();data?.error?reject(Object.assign(Error(data.error.message||'Deezer error'),{status:data.error.code===800?404:400})):resolve(data)};
      script.onerror=()=>{if(settled)return;finish();reject(Error('Deezer is unreachable'))};
      signal?.addEventListener('abort',()=>{if(settled)return;finish();reject(new DOMException('Aborted','AbortError'))},{once:true});
      script.src=`https://api.deezer.com${path}${path.includes('?')?'&':'?'}output=jsonp&callback=${name}`;document.head.append(script);
    });
  }
  // Wave genre label → Deezer genre id (its charts exist per genre).
  const GENRES=[[/kids/i,95],[/game|film|soundtrack|anime/i,173],[/rap|hip.?hop|drill|trap|grime/i,116],[/metal|core\b|metalcore|djent/i,464],[/rock|punk|grunge|emo/i,152],[/r&b|soul|funk/i,165],[/jazz|swing|bossa/i,129],[/classical|orchestra|chamber|opera|baroque/i,98],[/reggae|dancehall|dub\b/i,144],[/blues/i,153],[/latin|reggaeton|tango|salsa|bachata|cumbia/i,197],[/folk|country|bluegrass/i,466],[/alternative|indie/i,85],[/dance|disco|eurodance/i,113],[/house|techno|trance|edm|electro|dubstep|drum|bass|phonk|synth|ambient|lo.?fi|chill|chiptune|8.?bit/i,106],[/pop/i,132]];
  const genreId=label=>{for(const [pattern,id] of GENRES)if(pattern.test(String(label||'')))return id;return null};
  const normalize=(raw,genre=null)=>({...root.WaveTrackModel.normalizeTrack({sourceTrackId:raw.id,title:raw.title,artist:raw.artist?.name,album:raw.album?.title,artwork:raw.album?.cover_xl||raw.album?.cover_big||null,duration:raw.duration,genre,permalink:raw.link},'deezer'),isrc:raw.isrc||null,preview:raw.preview||null,rank:raw.rank||0,popularityScore:raw.rank?Math.min(1,raw.rank/1e6):undefined});
  const finish=(items,genre)=>{const tracks=(items||[]).filter(x=>x&&x.readable!==false&&x.title).map(x=>normalize(x,genre));tracks.pipeline={received:(items||[]).length,normalized:tracks.length};return tracks};
  const fullSourceReady=()=>!!root.WaveSpotifyPlayer?.usable();
  async function spotifyUri(track,signal){
    if(!fullSourceReady())return null;
    const queries=[track.isrc&&`isrc:${track.isrc}`,`track:"${track.title}" artist:"${track.artist}"`].filter(Boolean);
    for(const q of queries){const data=await root.WaveSpotify.api(`/search?type=track&limit=3&q=${encodeURIComponent(q)}`,{signal}),hit=(data?.tracks?.items||[]).find(x=>x?.uri&&x.is_playable!==false&&(!track.duration||Math.abs(x.duration_ms/1000-track.duration)<8));if(hit)return hit.uri}
    return null;
  }
  root.WaveSources=root.WaveSources||{};root.WaveSources.deezer={id:'deezer',label:'Deezer',enabled:()=>true,
    async searchTracks(text,{signal,limit=15}={}){const data=await jsonp(`/search?limit=${limit}&q=${encodeURIComponent(text)}`,signal);const tracks=finish(data?.data,null);for(const t of tracks){searched.set(String(t.sourceTrackId),t.preview);if(searched.size>500)searched.delete(searched.keys().next().value)}return tracks},
    // Charts feed the wave only while a service can play them in full.
    async getTracksByGenre(label,{signal,limit=40,offset=0}={}){const id=genreId(label);if(!fullSourceReady()||!id||offset>=100){const none=[];none.pipeline={received:0,normalized:0};return none}const data=await jsonp(`/chart/${id}/tracks?limit=${limit}&index=${offset}`,signal);return finish(data?.data,label)},
    async getTrendingTracks({signal,limit=40,offset=0}={}){if(!fullSourceReady()||offset>=100){const none=[];none.pipeline={received:0,normalized:0};return none}const data=await jsonp(`/chart/0/tracks?limit=${limit}&index=${offset}`,signal);return finish(data?.data,null)},
    async getStream(track,{signal}={}){
      const uri=await spotifyUri(track,signal).catch(()=>null);if(uri)return {url:uri,via:'spotify'};
      const youtube=root.WaveSources.youtube;
      if(youtube?.enabled()){try{const hit=await youtube.match(track,{signal});return {url:hit.streamUrl,via:'youtube'}}catch(error){if(signal?.aborted)throw error}}
      const id=String(track.sourceTrackId);if(track.previewAllowed)searched.set(id,track.preview);
      if(searched.has(id)){const fresh=await jsonp(`/track/${id}`,signal).catch(()=>null),preview=fresh?.preview||searched.get(id);if(!preview)throw Object.assign(Error('Deezer preview missing'),{status:404});root.dispatchEvent?.(new CustomEvent('wave-spotify-notice',{detail:'Играет 30 секунд из Deezer — подключи Spotify или YouTube в профиле, чтобы слушать целиком'}));return {url:preview,via:'preview',expiresAt:Date.now()+10*60*1000}}
      throw Object.assign(Error('No full version of the Deezer track'),{status:404});
    },
    normalizeTrack:normalize,genreId,jsonp,allowPreview:(id,preview)=>searched.set(String(id),preview||null)};
})(typeof window!=='undefined'?window:globalThis);
