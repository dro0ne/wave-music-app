// Tests execute the application's controller in an iframe with deterministic media and time.
const results=[],sequences=[];
function assert(value,message){if(!value)throw Error(message)}
const flush=async()=>{for(let i=0;i<40;i++)await Promise.resolve()};
let fixtureHtml=null;
function installFixture(seed=1){
  window.originalLoadCatalog=loadCatalog;
  clearInterval(timer);stopSound();cancelPreloadAudio();tabChannel?.close();if(tabChannel)tabChannel.postMessage=()=>{};
  playbackController.validationConcurrency=1;
  let now=0,taskId=0,tasks=new Map(),elements=new Set();
  Object.defineProperty(performance,'now',{value:()=>now,configurable:true});
  setTimeout=(fn,delay=0)=>{const id=++taskId;tasks.set(id,{fn,at:now+delay,interval:0});return id};
  setInterval=(fn,delay)=>{const id=++taskId;tasks.set(id,{fn,at:now+delay,interval:delay});return id};
  clearTimeout=clearInterval=id=>tasks.delete(id);
  class TestAudio{
    constructor(src=''){this.src=src;this.dataset={};this.currentTime=0;this.duration=180;this.readyState=4;this.networkState=1;this.volume=1;this.paused=true;this.ended=false;this.buffered={length:1,start:()=>0,end:()=>180};elements.add(this)}
    load(){this.onloadedmetadata?.();this.oncanplay?.()}
    play(){if(window.testPlayError)return Promise.reject(new DOMException('controlled',window.testPlayError));this.paused=false;this.ended=false;this.onplay?.();this.onplaying?.();return Promise.resolve()}
    pause(){if(this.paused)return;this.paused=true;this.onpause?.()}
    removeAttribute(name){if(name==='src')this.src='';else delete this[name]}
  }
  Audio=TestAudio;ensureWaveAudioContext=()=>null;attachWaveAnalyzer=()=>false;startWaveVisualizer=()=>{};stopWaveVisualizer=()=>{};
  window.testClock={tick(ms){const end=now+ms;let guard=0;while(now<end){let at=Math.min(end,...[...tasks.values()].map(x=>x.at));const delta=(at-now)/1000;for(const element of elements)if(!element.paused&&!element.ended)element.currentTime+=delta;now=at;
      for(const [id,task] of [...tasks])if(task.at<=now){if(task.interval)task.at+=task.interval;else tasks.delete(id);task.fn()}
      if(++guard>20000)throw Error('timer recursion');
    }},pending:()=>tasks.size};
  Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  state.genres=['Поп'];state.mood='Спокойствие';state.discovery=50;state.crossfadeEnabled=false;state.repeatCurrent=false;state.likes=[];state.dislikes=[];state.history=[];state.trackStats={};state.taste={genres:{},artists:{},subgenres:{}};
  waveSession=WaveRecommendation.createSession({sessionId:'fixture'});queue=[];index=0;catalog=Array.from({length:60},(_,i)=>WaveTrackModel.normalizeTrack({id:'fixture:'+String(i).padStart(2,'0'),source:'fixture',title:'Recording '+i,artist:'Artist '+i,genre:'Pop',duration:180,stream:'/fixture/'+i},'fixture'));
  playbackBuffer={current:null,next:null,backupNext:null};bufferFillPromise=null;preloadRequestId++;playbackController.sessionId='fixture';playbackController.event=null;playbackController.reservations.clear();playbackController.bindings.clear();playbackController.events=[];playbackController.confirmedStarts=[];playbackController.operation=null;playbackController.pendingNext=false;playbackController.recoveryPending=null;selectionInProgress=false;crossfadeInProgress=false;failedTrackIds.clear();verifiedPlayableTrackIds.clear();playing=false;playbackStoppedOnError=false;
  loadCatalog=async()=>catalog;sourceManager.resolveTrack=async track=>({...track,activeSource:'fixture'});validateStreamUrl=async()=>({status:200,contentType:'audio/wav',waveAnalysisAllowed:false});maybeReplenishCatalog=()=>{};
  window.fixtureTrack=i=>catalog[i];
}
async function inApp(fn,seed=1){
  if(!fixtureHtml){const html=await fetch('../index.html').then(r=>r.text());fixtureHtml=html.replace('<head>',`<head><base href="${new URL('../',location.href).href}"><script>window.__WAVE_TEST_MODE__=true;</script>`)}
  const frame=document.createElement('iframe');const loaded=new Promise(resolve=>frame.onload=resolve);frame.srcdoc=fixtureHtml;document.body.append(frame);await loaded;
  try{frame.contentWindow.eval('('+installFixture.toString()+')('+seed+')');return await frame.contentWindow.eval('('+fn.toString()+')()')}finally{frame.contentWindow.eval('clearInterval(timer);stopSound();cancelPreloadAudio()');frame.remove()}
}
async function test(id,fn){document.querySelector('#results').textContent='RUNNING '+id+'\n'+JSON.stringify(results);try{const evidence=await inApp(fn);assert(evidence.pass,JSON.stringify(evidence));results.push({id,pass:true,evidence})}catch(error){results.push({id,pass:false,error:error.message})}}
