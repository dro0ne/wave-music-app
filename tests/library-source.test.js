const results=[];async function test(name,fn){try{await fn();results.push(`PASS ${name}`)}catch(error){results.push(`FAIL ${name}: ${error.message}`)}}function assert(v,m){if(!v)throw Error(m)}
(async()=>{
  const lib=WaveSources.library;
  await test('library turns on when the server reports tracks',async()=>{await WaveProxy.check();assert(lib.enabled(),'not enabled')});
  await test('genre request asks the server by terms',async()=>{calls.length=0;await lib.getTracksByGenre('Post Rock',{limit:5,offset:10});assert(calls[0]==='api/library/tracks?terms=Post+Rock&limit=5&offset=10',calls[0])});
  await test('mood without genres searches the genres of that mood',async()=>{calls.length=0;await lib.getTracksByMood('Спокойствие',null);let terms=new URLSearchParams(calls[0].split('?')[1]).get('terms');assert(terms.split('|').includes('ambient'),terms)});
  await test('tracks keep licence, credit link, own stream and listener numbers',async()=>{let [t]=await lib.getTracksByGenre('Synthwave');assert(t.source==='library'&&t.license==='CC BY-NC-SA 3.0','licence lost');assert(t.licenseUrl==='https://creativecommons.org/licenses/by-nc-sa/3.0/',t.licenseUrl);assert(t.permalink==='https://archive.org/details/alb'&&t.plays===900,'credit or plays lost');assert(t.normalizedGenre==='electronic','genre not taken from tags');let again=WaveTrackModel.normalizeTrack(t,'library');assert(again.license==='CC BY-NC-SA 3.0'&&again.streamUrl==='media/ia/alb/01.mp3','renormalizing dropped fields');assert((await lib.getStream(t)).url==='media/ia/alb/01.mp3','bad stream')});
  let failed=results.filter(x=>x.startsWith('FAIL')).length;document.querySelector('#results').textContent=`${failed?'FAILED':'PASSED'}\n${results.join('\n')}`;
})();
