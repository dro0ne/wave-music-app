(function(root){
  // Accounts on our own server (server/accounts.py): each person signs in with a nickname and password and gets
  // their own likes, history, taste and settings, and with them their own recommendations, on any device.
  // The app keeps working from localStorage; signing in swaps that state for the account's one.
  const TOKEN='waveToken',PROFILE='waveProfile',SYNCED='waveSyncedAt',STATE='waveState',SAVE_DELAY=2500;
  const read=key=>{try{return localStorage.getItem(key)}catch{return null}},write=(key,value)=>{try{value==null?localStorage.removeItem(key):localStorage.setItem(key,value)}catch{}};
  let pending=null,timer=0,listeners=[];
  const account={
    get token(){return read(TOKEN)},
    get signedIn(){return !!read(TOKEN)},
    // Profiles need the server; on GitHub Pages or a local preview only the local nickname and avatar exist.
    async available(){return !!(await root.WaveProxy?.check?.())},
    profile(){try{return JSON.parse(read(PROFILE)||'null')||{}}catch{return {}}},
    setLocalProfile(profile){write(PROFILE,JSON.stringify(profile||{}));listeners.forEach(fn=>fn())},
    onChange(fn){listeners.push(fn)},
    async api(method,path,body){const headers={'Content-Type':'application/json'},token=read(TOKEN);if(token)headers.Authorization=`Bearer ${token}`;
      const response=await fetch(`api/account/${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body),keepalive:method!=='GET'&&JSON.stringify(body||'').length<60000});
      const data=await response.json().catch(()=>({}));if(response.status===401&&token&&path!=='login')this.forget();if(!response.ok)throw Object.assign(Error(data.message||'Сервер не ответил'),{status:response.status});return data},
    // After signing in the account's state replaces the local one (a fresh account takes over the local state).
    async enter(kind,name,password,currentState){const data=await this.api('POST',kind,{name,password});write(TOKEN,data.token);this.setLocalProfile(data.profile);
      if(data.state){write(STATE,JSON.stringify(data.state));write(SYNCED,String(data.stateUpdated||Date.now()/1000));return {reload:true}}
      await this.flush(currentState);return {reload:false}},
    async leave(){try{await this.api('POST','logout',{})}catch{}this.forget();write(STATE,null);write(SYNCED,null)},
    forget(){write(TOKEN,null);write(PROFILE,null);listeners.forEach(fn=>fn())},
    async updateProfile(changes){const local={...this.profile(),...changes};if(this.signedIn){const data=await this.api('PUT','profile',changes);this.setLocalProfile(data.profile);return data.profile}this.setLocalProfile(local);return local},
    // Called by the app on every save; sends at most one request per SAVE_DELAY.
    queueSave(state){if(!this.signedIn)return;pending=state;clearTimeout(timer);timer=setTimeout(()=>void this.flush(),SAVE_DELAY)},
    async flush(state=pending){clearTimeout(timer);if(!this.signedIn||!state)return;pending=null;try{const data=await this.api('PUT','state',{state});write(SYNCED,String(data.stateUpdated))}catch(error){console.warn('WAVE_ACCOUNT_SAVE_FAILED',error.message)}},
    // On start: refresh the profile and pick up changes made on another device (one reload at most).
    async sync(){if(!this.signedIn||!(await this.available()))return {reload:false};try{const data=await this.api('GET','me');this.setLocalProfile(data.profile);
      const local=Number(read(SYNCED)||0);if(data.state&&data.stateUpdated>local+1){write(STATE,JSON.stringify(data.state));write(SYNCED,String(data.stateUpdated));return {reload:true}}}catch(error){console.warn('WAVE_ACCOUNT_SYNC_FAILED',error.message)}return {reload:false}}
  };
  root.WaveAccount=account;
  root.addEventListener?.('pagehide',()=>{if(pending)void account.flush()});
})(typeof window!=='undefined'?window:globalThis);
