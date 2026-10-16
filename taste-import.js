(function(root){
  // Taste import: a public playlist from another service (read by server/importers.py, track list only) becomes a
  // starting taste. Its genres, subgenres and artists are added to state.taste with modest weights, about as much
  // as a handful of likes for the main genre, so the wave starts close to what someone likes and real listening
  // still takes over. Each import remembers exactly what it added, so removing or re-importing it undoes that.
  const MAX_IMPORTS=8,MAX_ARTISTS=150,GENRE_CAP=4,SUB_CAP=3,ARTIST_CAP=3;
  const round=n=>Math.round(n*100)/100,cyrillic=s=>/[а-яё]/i.test(s)&&!/[іїєґ]/i.test(s);
  const keyOf=result=>`${result.service}:${String(result.url||result.title||'').toLowerCase()}`;
  function scaled(counts,cap,factor){const total=Object.values(counts).reduce((a,b)=>a+b,0);if(!total)return {};const out={};
    for(const [name,value] of Object.entries(counts)){const weight=round(Math.min(cap,factor*value/total));if(weight>=.15)out[name]=weight}return out}
  function contribution(result){
    const families={},subs={},normalize=root.WaveGenre?.normalizeGenre;
    for(const [genre,count] of result.topGenres||[]){const parts=String(genre).split(',').map(x=>x.trim()).filter(Boolean);
      for(const part of parts){
        // "russian pop" is pop sung in Russian: the matcher would file the whole phrase under the language label.
        const russianPrefix=part.match(/^(?:russian|русск\S*)\s+(.+)$/i),share=count/parts.length,found=normalize?normalize(russianPrefix?russianPrefix[1]:part,[],{}):null;
        if(russianPrefix)subs.russian=(subs.russian||0)+share;
        if(!found||['other','unknown'].includes(found.normalizedGenre))continue;
        families[found.normalizedGenre]=(families[found.normalizedGenre]||0)+share;for(const sub of found.subgenres||[])subs[sub]=(subs[sub]||0)+share}}
    const genres=scaled(families,GENRE_CAP,12),subgenres=scaled(subs,SUB_CAP,10),artists={};
    // Russian-language music is a label of its own on the site; a playlist full of Cyrillic artists says as much as its genres.
    const tracks=result.tracks||[],russian=tracks.length?tracks.filter(t=>cyrillic(`${(t.artists||[]).join(' ')} ${t.title||''}`)).length/tracks.length:0;
    if(russian>=.15)subgenres.russian=round(Math.max(subgenres.russian||0,Math.min(SUB_CAP,russian*6)));
    for(const [name,count] of (result.topArtists||[]).slice(0,MAX_ARTISTS))artists[name]=round(Math.min(ARTIST_CAP,.8+Math.log2(count)*.55));
    return {genres,subgenres,artists,russianShare:round(russian)};
  }
  function addTo(state,part,sign){state.taste||={genres:{},artists:{},subgenres:{}};for(const field of ['genres','subgenres','artists']){const bag=state.taste[field]||={};
    for(const [name,value] of Object.entries(part[field]||{})){const next=round((bag[name]||0)+sign*value);if(Math.abs(next)<.01)delete bag[name];else bag[name]=next}}}
  function remove(state,key){const list=state.tasteImports||[],found=list.find(x=>x.key===key);if(!found)return false;addTo(state,found.contribution,-1);state.tasteImports=list.filter(x=>x!==found);return true}
  function apply(state,result,url){
    const key=keyOf({...result,url});remove(state,key);const part=contribution(result);addTo(state,part,1);
    const families=Object.entries(part.genres).sort((a,b)=>b[1]-a[1]).map(([name])=>name);
    const record={key,service:result.service,title:result.title,url:url||'',count:result.count,partial:!!result.partial,at:new Date().toISOString(),
      topArtists:(result.topArtists||[]).slice(0,12).map(([name])=>name),topGenres:families.slice(0,6),contribution:part};
    state.tasteImports=[record,...(state.tasteImports||[])];
    while(state.tasteImports.length>MAX_IMPORTS)remove(state,state.tasteImports.at(-1).key);
    return record;
  }
  async function fetchImport(body){
    let response;try{response=await fetch('api/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}catch{throw Error('Нет связи с сервером')}
    const data=await response.json().catch(()=>null);
    if(!data)throw Error(response.status===404||response.status===405?'Импорт работает только на сервере «Волны»':'Сервер не ответил');
    if(!response.ok)throw Error(data.message||'Не получилось импортировать');return data;
  }
  const SERVICES={yandex:'Яндекс Музыка',deezer:'Deezer',apple:'Apple Music',csv:'Файл',text:'Список'};
  root.WaveTasteImport={apply,remove,contribution,fetchImport,serviceName:id=>SERVICES[id]||id};
})(typeof window!=='undefined'?window:globalThis);
