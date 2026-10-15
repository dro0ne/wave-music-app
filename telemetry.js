(function(root){
  // Field reports for the doctor (tools/doctor): what freezes, what fails and what plays on real phones.
  // Only on our own server, only while "Отчёты о работе" is on; no passwords, no audio addresses.
  // Long tasks and frame rate are summed up per batch, so a slow phone does not send an event per frame.
  const DEVICE='waveDevice',FLUSH_MS=30000,MAX_EVENTS=150;
  const read=key=>{try{return localStorage.getItem(key)}catch{return null}};
  let device=read(DEVICE);if(!device){device=Math.random().toString(36).slice(2,12);try{localStorage.setItem(DEVICE,device)}catch{}}
  let events=[],longTasks=[],frames={count:0,since:performance.now(),samples:[]},lastAction=null,errorsSeen=new Set(),enabled=()=>true;
  const now=()=>Date.now(),push=event=>{if(events.length<MAX_EVENTS)events.push({t:now(),...event})};
  const trackInfo=t=>t?{id:String(t.id||''),title:String(t.title||'').slice(0,80),artist:String(t.artist||'').slice(0,60),source:t.activeSource||t.source||'',genre:t.normalizedGenre||t.genre||'',duration:Math.round(t.duration||0)}:null;
  const telemetry={
    // The app tells whether reports are allowed (settings switch) and who is listening.
    configure({isEnabled,context}){if(isEnabled)enabled=isEnabled;if(context)telemetry.context=context},
    context:()=>({}),
    // A user action starts the clock for "how long until music plays".
    action(name){lastAction={name,at:performance.now()};push({kind:'action',name})},
    play(track,extra={}){const waited=lastAction&&performance.now()-lastAction.at<60000?Math.round(performance.now()-lastAction.at):null;push({kind:'play',track:trackInfo(track),afterAction:lastAction?.name||null,waitMs:waited,...extra});lastAction=null},
    end(track,reason,listened){push({kind:'end',track:trackInfo(track),reason:String(reason||''),listened:Math.round(listened||0)})},
    failed(track,detail){push({kind:'failed',track:trackInfo(track),detail:String(detail||'').slice(0,120)})},
    note(kind,data){push({kind,...data})},
    async flush(useBeacon=false){
      if(root.__WAVE_NO_TELEMETRY__||!enabled()||!(await root.WaveProxy?.check?.()))return;
      const fps=frames.samples.splice(0),tasks=longTasks.splice(0),batch=events.splice(0);
      if(fps.length)batch.push({t:now(),kind:'fps',min:Math.min(...fps),avg:Math.round(fps.reduce((a,b)=>a+b,0)/fps.length),samples:fps.length});
      if(tasks.length)batch.push({t:now(),kind:'longtasks',count:tasks.length,totalMs:tasks.reduce((a,x)=>a+x.ms,0),worst:tasks.sort((a,b)=>b.ms-a.ms).slice(0,8)});
      if(!batch.length)return;
      const body=JSON.stringify({device,context:{...telemetry.context(),screen:`${screen.width}x${screen.height}@${devicePixelRatio}`,cores:navigator.hardwareConcurrency||null,memory:navigator.deviceMemory||null,ua:navigator.userAgent.slice(0,160)},events:batch});
      try{await fetch('api/telemetry',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:useBeacon&&body.length<60000})}catch{}
    }
  };
  // Long tasks: anything that blocked the page for 80 ms or more, tagged with the action just before it.
  try{new PerformanceObserver(list=>{for(const entry of list.getEntries()){if(entry.duration<80)continue;longTasks.push({ms:Math.round(entry.duration),after:lastAction&&entry.startTime-lastAction.at<3000?lastAction.name:null,playing:document.body?.classList.contains('wave-playing')||false});if(longTasks.length>200)longTasks.shift()}}).observe({type:'longtask',buffered:true})}catch{}
  // Frame rate while the wave plays and the page is visible, one sample per 5 s.
  const countFrame=at=>{if(!document.hidden&&document.body?.classList.contains('wave-playing')){frames.count++;if(at-frames.since>=5000){frames.samples.push(Math.round(frames.count*1000/(at-frames.since)));frames.count=0;frames.since=at}}else{frames.count=0;frames.since=at}requestAnimationFrame(countFrame)};requestAnimationFrame(countFrame);
  // Script errors, each distinct message once per page view.
  const error=(message,where)=>{const key=`${message}@${where}`;if(errorsSeen.has(key)||errorsSeen.size>30)return;errorsSeen.add(key);push({kind:'error',message:String(message).slice(0,200),where:String(where||'').slice(0,120)})};
  root.addEventListener('error',e=>error(e.message,`${(e.filename||'').split('/').pop()}:${e.lineno}`));
  root.addEventListener('unhandledrejection',e=>error(e.reason?.message||e.reason,'promise'));
  setInterval(()=>void telemetry.flush(),FLUSH_MS);
  root.addEventListener('pagehide',()=>void telemetry.flush(true));
  root.WaveTelemetry=telemetry;
})(window);
