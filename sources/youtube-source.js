(function(root){
  // YouTube through the official Data API v3 (search) and IFrame Player (playback, sources/embed-players.js).
  // The key is the listener's own (profile → Сервисы), restricted to this site in Google Cloud. A search costs 100 of the
  // 10 000 daily quota units, so results are cached for a week and matching other services' tracks is capped per day.
  const KEY_STORE='waveYoutubeKey',CACHE_STORE='waveYoutubeCache',BUDGET_STORE='waveYoutubeBudget',MATCHES_PER_DAY=40,CACHE_DAYS=7,CACHE_MAX=300;
  const read=(name,fallback)=>{try{return JSON.parse(localStorage.getItem(name)||'null')??fallback}catch{return fallback}};
  const write=(name,value)=>{try{localStorage.setItem(name,JSON.stringify(value))}catch{}};
  const key=()=>{try{return localStorage.getItem(KEY_STORE)||root.WaveSourceConfig?.YOUTUBE_API_KEY||''}catch{return ''}};
  const today=()=>new Date().toISOString().slice(0,10);
  let blockedDay='';
  // ISO 8601 duration (PT3M12S) → seconds.
  const seconds=value=>{const m=String(value||'').match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);return m?((+m[1]||0)*86400+(+m[2]||0)*3600+(+m[3]||0)*60+(+m[4]||0)):null};
  const decode=text=>{const el=document.createElement('textarea');el.innerHTML=text||'';return el.value};
  // "Artist - Title (Official Video)" → artist and a clean title; "Artist - Topic" channels are auto-generated music.
  function split(rawTitle,channel){
    let title=decode(rawTitle).replace(/\s*[([](?:official\s*)?(?:music\s*)?(?:video|audio|lyric(?:s)?(?:\s*video)?|visualizer|clip|клип|mv|hd|4k)[^\])]*[\])]/gi,'').replace(/\s*\|.*$/,'').trim(),artist=String(channel||'').replace(/\s*-\s*Topic$/i,'').replace(/VEVO$/i,'').trim();
    const dash=title.match(/^(.+?)\s+[-–—]\s+(.+)$/);if(dash){artist=dash[1].trim();title=dash[2].trim()}
    return {artist,title};
  }
  async function api(path,params,signal){
    if(!key())throw Object.assign(Error('YouTube key missing'),{code:'SOURCE_DISABLED'});
    if(blockedDay===today())throw Object.assign(Error('YouTube quota used up for today'),{status:429});
    const url=new URL(`https://www.googleapis.com/youtube/v3/${path}`);Object.entries({...params,key:key()}).forEach(([k,v])=>url.searchParams.set(k,v));
    const response=await fetch(url,{signal}),data=await response.json().catch(()=>({}));
    if(!response.ok){const reason=data?.error?.errors?.[0]?.reason||'';if(reason==='quotaExceeded'||reason==='dailyLimitExceeded'){blockedDay=today();root.dispatchEvent?.(new CustomEvent('wave-spotify-notice',{detail:'Лимит поиска YouTube на сегодня закончился — завтра снова заработает'}))}throw Object.assign(Error(data?.error?.message||`YouTube HTTP ${response.status}`),{status:response.status,reason})}
    return data;
  }
  function cached(text){const cache=read(CACHE_STORE,{}),hit=cache[text.toLowerCase()];return hit&&hit.at>Date.now()-CACHE_DAYS*864e5?hit.items:null}
  function remember(text,items){const cache=read(CACHE_STORE,{});cache[text.toLowerCase()]={at:Date.now(),items};const keys=Object.keys(cache);if(keys.length>CACHE_MAX)keys.sort((a,b)=>cache[a].at-cache[b].at).slice(0,keys.length-CACHE_MAX).forEach(k=>delete cache[k]);write(CACHE_STORE,cache)}
  const normalize=item=>{const {artist,title}=split(item.title,item.channel);return {...root.WaveTrackModel.normalizeTrack({sourceTrackId:item.id,title,artist,artwork:item.artwork,duration:item.duration,streamUrl:'youtube:'+item.id,permalink:`https://www.youtube.com/watch?v=${item.id}`},'youtube'),embedded:true}};
  async function search(text,{signal,limit=10}={}){
    let items=cached(text);
    if(!items){
      const found=await api('search',{part:'snippet',type:'video',videoCategoryId:'10',videoEmbeddable:'true',maxResults:String(limit),q:text},signal),ids=(found.items||[]).map(x=>x.id?.videoId).filter(Boolean);
      const details=ids.length?await api('videos',{part:'contentDetails,status',id:ids.join(',')},signal):{items:[]},info=new Map((details.items||[]).map(x=>[x.id,x]));
      items=(found.items||[]).filter(x=>info.get(x.id?.videoId)?.status?.embeddable!==false).map(x=>({id:x.id.videoId,title:x.snippet?.title,channel:x.snippet?.channelTitle,artwork:x.snippet?.thumbnails?.high?.url||x.snippet?.thumbnails?.medium?.url||null,duration:seconds(info.get(x.id.videoId)?.contentDetails?.duration)}));
      remember(text,items);
    }
    const tracks=items.filter(x=>!x.duration||x.duration<=20*60).map(normalize);tracks.pipeline={received:items.length,normalized:tracks.length};return tracks;
  }
  const words=text=>String(text||'').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(w=>w.length>1);
  // Finds the YouTube upload of another service's track: close duration and most of the title's words.
  async function match(track,{signal}={}){
    const budget=read(BUDGET_STORE,{});if(budget.day!==today()){budget.day=today();budget.used=0}
    const query=`${track.artist} ${track.title}`.trim();
    if(!cached(query)){if(budget.used>=MATCHES_PER_DAY)throw Object.assign(Error('YouTube match budget used up for today'),{status:429});budget.used++;write(BUDGET_STORE,budget)}
    const results=await search(query,{signal,limit:5}),want=words(track.title);
    const scored=results.map(r=>{const have=new Set(words(`${r.artist} ${r.title}`)),hit=want.filter(w=>have.has(w)).length/Math.max(1,want.length),gap=track.duration&&r.duration?Math.abs(track.duration-r.duration):10;return {r,score:hit-(gap>15?1:gap/30)}}).sort((a,b)=>b.score-a.score);
    if(!scored[0]||scored[0].score<.5)throw Object.assign(Error('No YouTube match'),{status:404});
    return scored[0].r;
  }
  root.WaveSources=root.WaveSources||{};root.WaveSources.youtube={id:'youtube',label:'YouTube',searchOnce:true,
    enabled:()=>!!key()&&blockedDay!==today(),
    searchTracks:(text,options)=>search(text,options),
    async getStream(track){if(!String(track.streamUrl||'').startsWith('youtube:'))throw Error('YouTube id missing');return {url:track.streamUrl}},
    match,normalizeTrack:normalize,
    key,setKey(value){try{value?localStorage.setItem(KEY_STORE,value.trim()):localStorage.removeItem(KEY_STORE)}catch{}blockedDay=''},
    async check(){await api('search',{part:'id',type:'video',maxResults:'1',q:'music'});return true},
    budget:()=>{const b=read(BUDGET_STORE,{});return {used:b.day===today()?b.used||0:0,limit:MATCHES_PER_DAY,blocked:blockedDay===today()}}};
})(typeof window!=='undefined'?window:globalThis);
