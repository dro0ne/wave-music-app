const output=document.querySelector('#results');
const state={likes:[],history:[],dislikes:[],trackStats:{},taste:{genres:{},artists:{}}};
const session=WaveRecommendation.createSession({currentMood:'Спокойствие',noveltyLevel:.5});
const context={state,session,selectedGenres:['Electronic','Pop']};
const eligible=t=>t.is_available!==false&&t.access?.stream!==false&&!t.stream_conditions&&!t.is_stream_gated&&!t.is_unlisted&&!t.is_delete&&!!t.track_cid;

async function validate(selected,rank){
  let track=selected.track,result={rank,trackId:track.id,title:track.title,score:+selected.finalScore.toFixed(4),http:0,contentType:'',playable:false};
  try{
    let resolved=await fetch(`https://api.audius.co/v1/tracks/${encodeURIComponent(track.id)}/stream?no_redirect=true`,{cache:'no-store'});
    if(!resolved.ok)throw Error(`resolve ${resolved.status}`);
    let json=await resolved.json();
    if(typeof json.data!=='string')throw Error('missing resolved URL');
    let stream=await fetch(json.data,{headers:{Range:'bytes=0-2047'},cache:'no-store'});
    result.http=stream.status;result.contentType=stream.headers.get('content-type')||'';
    result.playable=[200,206].includes(stream.status)&&result.contentType.toLowerCase().startsWith('audio/');
    if(stream.body)await stream.body.cancel();
  }catch(error){result.error=error.message}
  return result;
}

(async()=>{
  try{
    let response=await fetch(`https://api.audius.co/v1/tracks/trending?limit=50&_=${Date.now()}`,{cache:'no-store'}),json=await response.json();
    let catalog=(json.data||[]).filter(eligible).map(t=>({id:t.id,title:t.title,artist:t.user?.name||'',genre:t.genre||'',mood:'',tags:t.tags||'',duration:t.duration||180,source:'Audius'}));
    let ranking=WaveRecommendation.getRankedCandidates(catalog,context,10),results=[];
    for(let i=0;i<ranking.length;i++)results.push(await validate(ranking[i],i+1));
    let failures=results.filter(x=>!x.playable).length;
    output.textContent=`${failures?'COMPLETED WITH FAILURES':'PASSED'}\nCandidates: ${results.length}; playable: ${results.length-failures}; failed: ${failures}\n${JSON.stringify(results,null,2)}`;
    document.body.dataset.failed=String(failures);window.__audiusRankingResults=results;
  }catch(error){output.textContent=`FAILED\n${error.stack||error}`;document.body.dataset.failed='1'}
})();
