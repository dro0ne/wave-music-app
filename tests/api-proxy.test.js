const results=[];async function test(name,fn){try{await fn();results.push(`PASS ${name}`)}catch(error){results.push(`FAIL ${name}: ${error.message}`)}}function assert(v,m){if(!v)throw Error(m)}
(async()=>{
  await test('catalog reads map to the backend, streams do not',()=>{assert(WaveProxy.route('https://api.audius.co/v1/tracks/search?query=a&genre=Rock')==='api/audius/v1/tracks/search?query=a&genre=Rock','search');assert(WaveProxy.route('https://api.audius.co/v1/tracks/trending?limit=5')==='api/audius/v1/tracks/trending?limit=5','trending');assert(WaveProxy.route('https://api.jamendo.com/v3.0/tracks/?client_id=&search=x')==='api/jamendo/tracks?client_id=&search=x','jamendo');assert(WaveProxy.route('https://api.audius.co/v1/tracks/12/stream?no_redirect=true')===null,'stream proxied')});
  await test('backend health turns on proxy and Jamendo',async()=>{await WaveProxy.check();assert(WaveProxy.available&&WaveProxy.jamendo,'not enabled')});
  await test('catalog goes through the backend when it answers',async()=>{let r=await(await WaveProxy.fetch('https://api.audius.co/v1/tracks/search?query=a')).json();assert(r.via==='proxy',r.via)});
  await test('backend failure falls back to the direct API',async()=>{backend.failCatalog=true;let r=await(await WaveProxy.fetch('https://api.audius.co/v1/tracks/search?query=b')).json();backend.failCatalog=false;assert(r.via==='direct',r.via)});
  await test('streams always go direct',async()=>{calls.length=0;await WaveProxy.fetch('https://api.audius.co/v1/tracks/12/stream?no_redirect=true');assert(calls.length===1&&calls[0].startsWith('https://'),calls.join(' '))});
  let failed=results.filter(x=>x.startsWith('FAIL')).length;document.querySelector('#results').textContent=`${failed?'FAILED':'PASSED'}\n${results.join('\n')}`;
})();
