(function(root){
  // Spotify sign-in with Authorization Code + PKCE, entirely in the browser: no client secret, no server.
  // Spotify redirects back to the site root (the registered redirect URI), so this file is loaded by every page
  // that may receive the redirect; it trades the code for tokens and returns to the page that started the sign-in.
  const CLIENT_ID='378bc1edc18a457a8e163abe6802956d';
  const SCOPES='streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read user-library-modify playlist-read-private playlist-read-collaborative';
  const TOKENS='waveSpotifyTokens',PENDING='waveSpotifyPending',ACCOUNTS='https://accounts.spotify.com',API='https://api.spotify.com/v1';
  const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}},write=(key,value)=>{try{value==null?localStorage.removeItem(key):localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const base64url=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const randomString=length=>base64url(crypto.getRandomValues(new Uint8Array(length))).slice(0,length);
  async function challengeOf(verifier){return base64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)))}
  // Registered: https://dro0ne.github.io/wave-music-app/ and http://127.0.0.1:8765/ — both are the folder of index.html.
  const redirectUri=()=>new URL('./',location.href).href;
  let tokens=read(TOKENS),refreshing=null,lastError=null;

  async function login(returnTo=location.pathname+location.search+location.hash){
    const verifier=randomString(64),state=randomString(16);
    write(PENDING,{verifier,state,returnTo,redirectUri:redirectUri()});
    const params=new URLSearchParams({response_type:'code',client_id:CLIENT_ID,scope:SCOPES,redirect_uri:redirectUri(),state,code_challenge_method:'S256',code_challenge:await challengeOf(verifier)});
    location.assign(`${ACCOUNTS}/authorize?${params}`);
  }
  async function requestTokens(body){
    const response=await fetch(`${ACCOUNTS}/api/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:CLIENT_ID,...body})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Object.assign(Error(data.error_description||data.error||`Spotify token HTTP ${response.status}`),{status:response.status,code:data.error});
    tokens={access:data.access_token,refresh:data.refresh_token||tokens?.refresh,scope:data.scope,expiresAt:Date.now()+data.expires_in*1000};write(TOKENS,tokens);return tokens;
  }
  // Returns true when this page load was a Spotify redirect (handled or failed); the URL is cleaned either way.
  async function handleRedirect(){
    const params=new URLSearchParams(location.search),pending=read(PENDING);
    if(!pending||!params.has('state')||!(params.has('code')||params.has('error')))return false;
    write(PENDING,null);
    const clean=()=>history.replaceState(null,'',location.pathname+location.hash);
    if(params.get('state')!==pending.state){clean();lastError='state mismatch';return true}
    if(params.has('error')){clean();lastError=params.get('error');return true}
    try{await requestTokens({grant_type:'authorization_code',code:params.get('code'),redirect_uri:pending.redirectUri,code_verifier:pending.verifier})}catch(error){lastError=error.message}
    clean();
    const back=new URL(pending.returnTo,location.href);if(back.pathname!==location.pathname)location.replace(back.href);
    return true;
  }
  async function token(){
    if(!tokens?.access)return null;
    if(tokens.expiresAt-60000>Date.now())return tokens.access;
    if(!tokens.refresh)return null;
    refreshing=refreshing||requestTokens({grant_type:'refresh_token',refresh_token:tokens.refresh}).catch(error=>{if(error.status===400){tokens=null;write(TOKENS,null)}throw error}).finally(()=>{refreshing=null});
    return (await refreshing).access;
  }
  // Web API call with one retry on an expired token (401) and on rate limiting (429, waits Retry-After).
  async function api(path,init={},retried=false){
    const access=await token();if(!access)throw Object.assign(Error('Spotify not connected'),{status:401});
    const response=await fetch(path.startsWith('http')?path:API+path,{...init,headers:{Authorization:`Bearer ${access}`,...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}});
    if(!retried&&response.status===401){tokens.expiresAt=0;return api(path,init,true)}
    if(!retried&&response.status===429){const wait=Math.min(30,Number(response.headers.get('Retry-After'))||1);await new Promise(resolve=>setTimeout(resolve,wait*1000));return api(path,init,true)}
    if(!response.ok){const data=await response.json().catch(()=>({}));throw Object.assign(Error(data.error?.message||`Spotify HTTP ${response.status}`),{status:response.status,reason:data.error?.reason})}
    return response.status===204?null:response.json().catch(()=>null);
  }
  function logout(){tokens=null;write(TOKENS,null)}

  root.WaveSpotify={CLIENT_ID,SCOPES,login,logout,token,api,handleRedirect,challengeOf,redirectUri,connected:()=>!!tokens?.access,get lastError(){return lastError},
    ready:typeof location!=='undefined'?handleRedirect():Promise.resolve(false)};
})(typeof window!=='undefined'?window:globalThis);
