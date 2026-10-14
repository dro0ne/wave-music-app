(function(root){
  // On our own server a backend at api/ caches catalog reads and holds API keys (see server/api.py).
  // GitHub Pages and a local preview have no backend: health fails once and sources call their APIs directly.
  const ROUTES=[[/^https:\/\/api\.audius\.co\/v1\/(tracks\/(?:search|trending|latest)\?.*)$/,'api/audius/v1/$1'],[/^https:\/\/api\.jamendo\.com\/v3\.0\/tracks\/?\?(.*)$/,'api/jamendo/tracks?$1']];
  let health=null;
  const proxy={jamendo:false,available:false,
    check(){if(!health)health=fetch('api/health',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null).then(info=>{proxy.available=!!info?.ok;proxy.jamendo=!!info?.ok&&!!info.jamendo;return proxy.available});return health},
    route(url){for(const [re,to] of ROUTES)if(re.test(url))return url.replace(re,to);return null},
    // Uses the backend when it is there and answers; any failure falls back to the direct request.
    async fetch(url,options={}){let local=await proxy.check()&&proxy.route(url);if(local){try{let response=await fetch(local,options);if(response.ok)return response}catch(error){if(error.name==='AbortError')throw error}}return fetch(url,options)}};
  root.WaveProxy=proxy;
  if(typeof fetch==='function')proxy.check();
})(typeof window!=='undefined'?window:globalThis);
