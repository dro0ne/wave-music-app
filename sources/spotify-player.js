(function(root){
  // Spotify tracks play through the official Web Playback SDK, which owns its audio and gives no access to the sound.
  // SpotifyMediaElement wraps it in the part of the HTMLMediaElement interface app.js uses (src, play, pause,
  // currentTime, duration, volume, readyState, on* handlers), so a Spotify track goes through the same progress,
  // seek, ended, error and recovery paths as an <audio>. One SDK player serves every element; the element that
  // called play() last owns it.
  const SDK_URL='https://sdk.scdn.co/spotify-player.js',HANDLERS=['onplay','onplaying','onpause','onended','onerror','onwaiting','onstalled','oncanplay','oncanplaythrough','onloadeddata','onloadedmetadata','ontimeupdate','onseeking','onseeked'];
  const status={widevine:null,premium:null,account:null,country:null,error:null,deviceId:null};
  let sdk=null,readyTask=null,owner=null,poller=null;
  const isUri=value=>typeof value==='string'&&value.startsWith('spotify:track:');
  const sameTrack=(track,uri)=>!!track&&(track.uri===uri||track.linked_from?.uri===uri);

  async function widevine(){
    if(!navigator.requestMediaKeySystemAccess)return false;
    try{await navigator.requestMediaKeySystemAccess('com.widevine.alpha',[{initDataTypes:['cenc'],audioCapabilities:[{contentType:'audio/mp4;codecs="mp4a.40.2"'}]}]);return true}catch{return false}
  }
  function loadSdk(){
    if(root.Spotify?.Player)return Promise.resolve();
    return new Promise((resolve,reject)=>{root.onSpotifyWebPlaybackSDKReady=resolve;const script=document.createElement('script');script.src=SDK_URL;script.onerror=()=>reject(Error('Spotify SDK did not load'));document.head.append(script)});
  }
  // Checks the account and browser once, then connects the SDK player; failures other than "no Premium" or
  // "no Widevine" are retried on the next call.
  function ready(){
    if(readyTask)return readyTask;
    readyTask=(async()=>{
      if(!root.WaveSpotify?.connected())throw Error('Spotify not connected');
      if(status.widevine===null)status.widevine=await widevine();
      if(!status.widevine)throw Error('Widevine unavailable');
      const me=await root.WaveSpotify.api('/me');status.premium=me.product==='premium';status.account=me.display_name||me.id;status.country=me.country||null;
      if(!status.premium)throw Error('Spotify Premium required');
      await loadSdk();
      const player=new root.Spotify.Player({name:'Волна',volume:.6,getOAuthToken:callback=>root.WaveSpotify.token().then(callback,()=>callback(''))});
      const device=new Promise((resolve,reject)=>{player.addListener('ready',({device_id})=>{status.deviceId=device_id;resolve()});setTimeout(()=>reject(Error('Spotify player timeout')),12000)});
      player.addListener('not_ready',()=>{status.deviceId=null});
      player.addListener('player_state_changed',onState);
      player.addListener('account_error',({message})=>{status.premium=false;status.error=message});
      player.addListener('authentication_error',({message})=>{status.error=message});
      player.addListener('initialization_error',({message})=>{status.error=message});
      player.addListener('playback_error',({message})=>{status.error=message;owner?._fail(message)});
      if(!await player.connect())throw Error('Spotify player did not connect');
      await device;sdk=player;status.error=null;return player;
    })();
    readyTask.catch(error=>{status.error=error.message;readyTask=null});
    return readyTask;
  }
  async function playUri(uri,seconds,retried=false){
    try{await root.WaveSpotify.api(`/me/player/play?device_id=${encodeURIComponent(status.deviceId)}`,{method:'PUT',body:JSON.stringify({uris:[uri],position_ms:Math.round(seconds*1000)})})}
    catch(error){
      // The SDK device can expire (sleep, network change): reconnect once and try again.
      if(retried||error.status!==404)throw error;sdk?.disconnect();sdk=null;readyTask=null;status.deviceId=null;await ready();return playUri(uri,seconds,true);
    }
  }
  function onState(state){
    const element=owner;if(!element||!element._started)return;
    if(!state){element._lost();return}
    const track=state.track_window?.current_track;
    if(sameTrack(track,element._src)){
      element._position=state.position/1000;element._at=performance.now();element._maxPosition=Math.max(element._maxPosition,element._position);
      if(state.duration>0&&element.duration!==state.duration/1000){const first=!Number.isFinite(element.duration);element.duration=state.duration/1000;element.readyState=4;if(first){element._emit('onloadedmetadata');element._emit('oncanplay')}}
      if(!state.paused&&!state.loading&&!element.paused&&!element._announced){element._announced=true;element._emit('onplaying')}
      if(state.paused&&!element.paused){
        // A single-track context that ran out stops at position 0; anything else is a pause from elsewhere
        // (keyboard media key, the Spotify app on another device).
        if(state.position===0&&element._nearEnd())element._finish();else{element.paused=true;element._announced=false;element._emit('onpause')}
      }
      else if(!state.paused&&element.paused){element.paused=false;element._emit('onplay');element._announced=true;element._emit('onplaying')}
      element._emit('ontimeupdate');
    }else if(track){
      // Spotify moved on: its autoplay after our track ended, or someone picked another track in the Spotify app.
      if(element._nearEnd()){void sdk?.pause().catch(()=>{});element._finish()}else element._lost();
    }
  }
  function startPolling(){
    if(poller)return;
    poller=setInterval(async()=>{if(!sdk||!owner||owner.paused||!owner._started){clearInterval(poller);poller=null;return}try{onState(await sdk.getCurrentState())}catch{}},1000);
  }

  class SpotifyMediaElement{
    constructor(){
      this.dataset={};this.preload='auto';this.crossOrigin=null;this.paused=true;this.ended=false;this.readyState=0;this.networkState=0;this.duration=NaN;this.error=null;this.buffered={length:0};
      this._src='';this._volume=1;this._position=0;this._at=0;this._maxPosition=0;this._started=false;this._announced=false;
      for(const name of HANDLERS)this[name]=null;
    }
    get src(){return this._src}
    set src(value){value=String(value||'');if(value===this._src)return;this._halt();this._src=value;this._started=false;this._announced=false;this.readyState=0;this.ended=false;this.error=null;this._position=0;this._maxPosition=0;this.duration=NaN}
    get currentTime(){if(this.paused||!this._started)return this._position;const limit=Number.isFinite(this.duration)?this.duration:Infinity;return Math.min(limit,this._position+(performance.now()-this._at)/1000)}
    set currentTime(value){this._position=Math.max(0,Number(value)||0);this._at=performance.now();if(owner===this&&this._started)void sdk?.seek(Math.round(this._position*1000)).catch(()=>{})}
    get volume(){return this._volume}
    set volume(value){this._volume=Math.max(0,Math.min(1,Number(value)||0));if(owner===this)void sdk?.setVolume(this._volume).catch(()=>{})}
    setAttribute(){}
    removeAttribute(name){if(name==='src'){this._halt();this._src='';this._started=false}}
    load(){if(!this._src)this._halt()}
    async play(){
      if(!isUri(this._src))throw new DOMException('Not a Spotify track','NotSupportedError');
      if(!this.paused&&owner===this&&this._started)return;
      this.paused=false;this.ended=false;this.error=null;this._emit('onplay');
      try{
        await ready();if(this.paused)return;
        const previous=owner;owner=this;if(previous&&previous!==this)previous._lost();
        await sdk.activateElement?.();await sdk.setVolume(this._volume);
        if(this._started)await sdk.resume();
        else{this._started=true;this._announced=false;await playUri(this._src,this._position)}
        this._at=performance.now();startPolling();
      }catch(error){
        if(owner===this)owner=null;this.paused=true;this._started=false;this.error={code:4,message:error.message};
        throw new DOMException(error.message,'NotSupportedError');
      }
    }
    pause(){
      if(this.paused)return;this._position=this.currentTime;this.paused=true;this._announced=false;
      if(owner===this&&this._started)void sdk?.pause().catch(()=>{});
      this._emit('onpause');
    }
    _nearEnd(){return Number.isFinite(this.duration)&&Math.max(this._maxPosition,this.currentTime)>=this.duration-3}
    _finish(){this._position=Number.isFinite(this.duration)?this.duration:this._position;this.paused=true;this.ended=true;this._started=false;if(owner===this)owner=null;this._emit('onended')}
    // Another element or another device took the SDK over; keep the position so play() can continue from it.
    _lost(){const wasPlaying=!this.paused;this._position=this.currentTime;this.paused=true;this._started=false;this._announced=false;if(owner===this)owner=null;if(wasPlaying)this._emit('onpause')}
    _fail(message){this.error={code:4,message};this.paused=true;this._started=false;if(owner===this)owner=null;this._emit('onerror')}
    _halt(){if(owner===this){owner=null;if(this._started)void sdk?.pause().catch(()=>{})}this._position=this.currentTime;this.paused=true;this._started=false;this._announced=false}
    _emit(name){const handler=this[name];if(typeof handler!=='function')return;try{handler.call(this,{type:name.slice(2),target:this})}catch(error){console.error(error)}}
  }

  root.WaveSpotifyPlayer={Element:SpotifyMediaElement,isUri,ready,status,
    isElement:value=>value instanceof SpotifyMediaElement,
    // Search offers Spotify tracks while playback is still possible: connected, and neither Premium nor Widevine
    // has been found missing.
    usable:()=>!!root.WaveSpotify?.connected()&&status.premium!==false&&status.widevine!==false,
    disconnect(){owner?._lost();sdk?.disconnect();sdk=null;readyTask=null;status.deviceId=null;status.premium=null;status.account=null;status.error=null}};
})(typeof window!=='undefined'?window:globalThis);
