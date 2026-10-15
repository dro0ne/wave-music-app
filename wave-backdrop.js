(function(root){
  // Decorative only: receives an existing analyser and never owns playback.
  // Glowing "snakes" circle the wave orb and dance to the music, with loose fireflies drifting around them:
  // the snakes speed up with the tempo, ripple with the bass and leap off the ring on every beat.
  const TAU=Math.PI*2,rand=(a=0,b=1)=>a+Math.random()*(b-a);
  const PALETTES={'Спокойствие':['#7c6cff','#5b8cff','#9fd8ff','#c7b8ff'],'Энергия':['#ff7a3d','#ffb347','#ffe066','#ff4d6d'],'Мечтательно':['#a46bff','#6f8bff','#ff9be2','#c9b6ff'],'Фокус':['#3fd0c9','#5bc0ff','#b9ff4b','#9ff2e6'],'Романтика':['#ff5fa2','#ff8fc7','#d36bff','#ffc2dc'],'Вечеринка':['#ff4fd8','#7a5cff','#3ddcff','#b9ff4b']};
  // How many snakes circle the orb and how lively they move for each mood.
  const MOTION={'Спокойствие':{snakes:2,pace:.7},'Фокус':{snakes:2,pace:.6},'Мечтательно':{snakes:3,pace:.85},'Романтика':{snakes:2,pace:.8},'Энергия':{snakes:3,pace:1.3},'Вечеринка':{snakes:4,pace:1.45}};
  // Share of particles in the snakes; the rest are fireflies.
  const SNAKE_SHARE=.72;
  // All glow sprites (colour x size step x brightness step) live in one atlas image, so a frame is a run of plain
  // copies from a single texture: no per-particle scaling, alpha changes or texture switches.
  const SIZES=[3,5,7,9,12,15,19,24],ALPHAS=[.45,.7,1],CELL=26;
  function buildAtlas(colors){const atlas=document.createElement('canvas');atlas.width=CELL*SIZES.length*ALPHAS.length;atlas.height=CELL*colors.length;const g=atlas.getContext('2d'),cells=colors.map((color,row)=>SIZES.map((size,si)=>ALPHAS.map((alpha,ai)=>{const x=(si*ALPHAS.length+ai)*CELL,y=row*CELL,r=g.createRadialGradient(x+size/2,y+size/2,0,x+size/2,y+size/2,size/2);r.addColorStop(0,'#ffffff');r.addColorStop(.18,color);r.addColorStop(.45,color+'55');r.addColorStop(1,color+'00');g.globalAlpha=alpha;g.fillStyle=r;g.fillRect(x,y,size,size);return [x,y,size]})));return {atlas,cells}}

  // WebGL path: all particles go to the GPU in one buffer and are drawn with one call, with a radial glow computed
  // in the fragment shader and additive blending. Canvas 2D (one drawImage per particle) is kept as a fallback.
  const VERTEX=`attribute vec2 a_pos;attribute float a_size;attribute vec4 a_color;uniform vec2 u_view;uniform float u_ratio;varying vec4 v_color;
    void main(){gl_Position=vec4(a_pos/u_view*2.0-1.0,0.0,1.0);gl_Position.y=-gl_Position.y;gl_PointSize=a_size*u_ratio;v_color=a_color;}`;
  const FRAGMENT=`precision mediump float;varying vec4 v_color;
    void main(){float d=length(gl_PointCoord-0.5)*2.0;if(d>1.0)discard;float glow=exp(-d*d*4.5)*(1.0-d);float core=smoothstep(0.32,0.0,d);
      vec3 rgb=mix(v_color.rgb,vec3(1.0),core*0.85);gl_FragColor=vec4(rgb*glow*v_color.a,glow*v_color.a);}`;
  const FLOATS=7,hexRgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  function createGl(canvas){
    try{
      const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:false,powerPreference:'low-power'});if(!gl)return null;
      const shader=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh};
      const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const stride=FLOATS*4,attr=(name,size,offset)=>{const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride,offset*4)};
      attr('a_pos',2,0);attr('a_size',1,2);attr('a_color',4,3);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.clearColor(0,0,0,0);
      return {gl,view:gl.getUniformLocation(program,'u_view'),ratio:gl.getUniformLocation(program,'u_ratio'),maxPoint:gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1]||64,data:null};
    }catch(error){console.warn('WAVE_BACKDROP_WEBGL_UNAVAILABLE',error.message);return null}
  }

  class WaveBackdrop{
    constructor(canvas,readAnalyser,options={}){
      this.canvas=canvas;this.glState=options.renderer==='2d'||!canvas?null:createGl(canvas);this.context=this.glState?this.glState.gl:canvas?.getContext('2d');this.readAnalyser=readAnalyser;this.readBpm=options.readBpm||(()=>90);this.anchor=options.anchor||null;
      this.state='IDLE';this.mood='Спокойствие';this.frame=0;this.last=0;this.phase=0;this.activity=0;this.bands={bass:0,mid:0,high:0,rms:0};this.frames=0;this.costs=[];this.intervals=[];this.reduced=root.matchMedia('(prefers-reduced-motion: reduce)');
      this.particles=[];this.snakes=[];this.beats=0;this.beatPulse=0;this.kick=0;this.beatClock=0;this.bpm=90;this.flux=[];this.onsets=[];this.lastOnset=0;this.period=0;this.nextBeatAt=0;this.locked=false;this.quality=1;this.sprites=[];this.center={x:0,y:0,r:100};
      this.resize=()=>{if(!this.context)return;const rect=canvas.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);this.mobile=this.width<768;this.ratio=Math.min(root.devicePixelRatio||1,this.mobile?1.25:1.5);canvas.width=Math.round(this.width*this.ratio);canvas.height=Math.round(this.height*this.ratio);if(this.glState)this.context.viewport(0,0,canvas.width,canvas.height);else this.context.setTransform(this.ratio,0,0,this.ratio,0,0);const count=this.mobile?600:900;if(this.particles.length!==count)this.spawn(count);this.locate();this.render();this.resume()};
      this.enabled=true;this.tick=now=>{this.frame=0;if(document.hidden||this.reduced.matches||!this.context||!this.enabled||!this.onScreen)return;
        // While the page is being scrolled the snakes hold still, so scrolling gets the whole frame budget.
        if(now-this.scrolled<150){this.last=0;this.frame=requestAnimationFrame(this.tick);return}
        // Phones run at 30 fps; a frame is skipped only when it comes clearly early, so 60 Hz screens never judder.
        const target=this.mobile?30:60;if(target<50&&this.last&&now-this.last<1000/target*.75){this.frame=requestAnimationFrame(this.tick);return}
        const dt=Math.min(.1,this.last?(now-this.last)/1000:1/60);if(this.last){this.intervals.push(now-this.last);if(this.intervals.length>180)this.intervals.shift()}this.last=now;
        const started=performance.now();this.update(dt);this.render();const cost=performance.now()-started;this.costs.push(cost);if(this.costs.length>180)this.costs.shift();this.cost=this.cost?this.cost*.97+cost*.03:cost;
        if(this.frames%60===0){if(this.cost>9)this.quality=Math.max(.4,this.quality*.9);else if(this.cost<5)this.quality=Math.min(1,this.quality*1.04)}
        this.frames++;this.frame=requestAnimationFrame(this.tick)};
      this.motion=()=>{this.suspend();this.last=0;if(this.reduced.matches){this.activity=0;for(const key of Object.keys(this.bands))this.bands[key]=0;this.settle();this.render()}else this.resume()};
      root.addEventListener('resize',this.resize);if(this.glState){canvas.addEventListener('webglcontextlost',event=>event.preventDefault());canvas.addEventListener('webglcontextrestored',()=>{this.glState=createGl(canvas);this.context=this.glState?.gl||null;this.resize()})}this.reduced.addEventListener?.('change',this.motion);
      // Nothing to draw once the orb has scrolled out of view: the animation stops until it comes back.
      this.scrolled=0;root.addEventListener('scroll',()=>{this.scrolled=performance.now()},{passive:true});this.onScreen=true;if(this.anchor&&root.IntersectionObserver){new IntersectionObserver(entries=>{this.onScreen=entries.at(-1).isIntersecting;this.onScreen?this.resume():this.suspend()},{rootMargin:'120px'}).observe(this.anchor)}document.addEventListener('visibilitychange',()=>document.hidden?this.suspend():this.resume());this.palette();this.resize();this.settle();
    }
    spawn(count){const old=this.particles;this.particles=Array.from({length:count},(_,i)=>old[i]||{x:rand(0,this.width||800),y:rand(0,this.height||600),vx:0,vy:0,seed:Math.random(),size:rand(.55,1.35),color:i%4});this.cast()}
    // Splits the particles into snakes (head first) and fireflies with their own orbit, speed and colour.
    cast(){const motion=MOTION[this.mood]||MOTION['Спокойствие'],snakes=motion.snakes,body=Math.floor(this.particles.length*SNAKE_SHARE/snakes);this.snakes=Array.from({length:snakes},(_,k)=>this.snakes?.[k]||{angle:rand(0,TAU)});
      this.snakes.forEach((snake,k)=>{snake.dir=k%2?-1:1;snake.orbit=1.12+k*(this.mobile?.11:.16);snake.length=1.1+(k%3)*.35;snake.speed=.8+k*.18;snake.twist=2+k});
      this.particles.forEach((p,i)=>{const k=Math.floor(i/body);if(k<snakes){p.snake=k;p.s=(i%body)/body;p.color=k%4;p.offset=(p.seed-.5)*2}else{p.snake=-1;p.s=0;p.orbit=rand(1.05,2.1);p.angle=rand(0,TAU);p.spin=rand(.04,.16)*(Math.random()<.5?-1:1);p.color=Math.floor(rand(0,4))}})}
    palette(){const colors=PALETTES[this.mood]||PALETTES['Спокойствие'];this.colors=[...colors,'#eaf6ff'].map(hexRgb);if(this.glState){this.sprites=[1];return}const {atlas,cells}=buildAtlas([...colors,'#eaf6ff']);this.atlas=atlas;this.sprites=cells}
    // Centre and radius of the orb in canvas coordinates; without a visible orb the dance sits in the upper right.
    locate(){const canvasRect=this.canvas.getBoundingClientRect(),orb=this.anchor?.getBoundingClientRect?.();
      if(!orb||!orb.width){this.center={x:this.width*(this.mobile?.5:.72),y:Math.min(this.height*.4,300),r:Math.min(this.width,this.height)*.16};return}
      this.center={x:orb.left+orb.width/2-canvasRect.left,y:orb.top+orb.height/2-canvasRect.top,r:Math.min(orb.width,orb.height)/2}}
    // Where a particle wants to be right now: along its snake's body or on its firefly orbit.
    target(p,t){const {x:cx,y:cy,r}=this.center,bass=this.bands.bass,pulse=this.beatPulse;
      if(p.snake<0){const a=p.angle,rad=r*(p.orbit+Math.sin(this.phase*.7+p.seed*20)*.07+pulse*.08*p.orbit);t[0]=cx+Math.cos(a)*rad;t[1]=cy+Math.sin(a)*rad;return}
      const snake=this.snakes[p.snake],s=p.s,a=snake.angle-snake.dir*s*snake.length*(1+this.activity*.25),
        // The body sways, a bass wave runs from head to tail and each beat lifts the head off the ring.
        sway=Math.sin(a*snake.twist+this.phase*2.2+p.snake)*.07,ripple=Math.sin(s*TAU*2-this.phase*7)*bass*.1*(1-s*.5),leap=pulse*.22*Math.max(0,1-s*1.8),
        rad=r*(snake.orbit+sway+ripple+leap)+p.offset*r*.045*(1-s*.75);
      t[0]=cx+Math.cos(a)*rad;t[1]=cy+Math.sin(a)*rad}
    settle(){this.locate();const t=[0,0];this.particles.forEach(p=>{this.target(p,t);p.x=t[0];p.y=t[1];p.vx=p.vy=p.ox=p.oy=0})}
    burst(strength){const {x,y}=this.center;for(const p of this.particles){const dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy)||1,force=strength*rand(60,160);p.vx+=dx/d*force;p.vy+=dy/d*force}}
    // Called by the app when a new track starts: the snakes scatter a little and the tempo eases over.
    trackChanged(bpm){if(Number(bpm)>0)this.targetBpm=Number(bpm);this.onsets=[];this.locked=false;this.burst(.5)}
    setState(state){if(this.state!==state){this.costs=[];this.intervals=[];this.last=0}this.state=state;this.resume()}
    setMood(mood){if(mood===this.mood)return;this.mood=mood;this.palette();this.cast();this.burst(.4);this.render()}
    suspend(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0}
    resume(){if(!this.context||!this.enabled||!this.onScreen||document.hidden||this.reduced.matches||this.frame)return;this.frame=requestAnimationFrame(this.tick)}
    // The particles can be switched off in settings; the canvas is hidden and stops drawing entirely.
    setEnabled(on){this.enabled=!!on;if(this.canvas)this.canvas.hidden=!this.enabled;if(this.enabled){this.last=0;this.resume()}else this.suspend()}
    // On every beat the snakes lunge forward and their heads leap off the ring.
    beat(strength){this.beats++;this.beatPulse=Math.min(1.3,.7+strength*.6);this.kick=1;for(const snake of this.snakes)snake.lunge=(snake.lunge||0)+.18+strength*.22}
    // Reads the analyser. Beats are found from sudden rises of low-frequency energy (spectral flux), not from its level:
    // loud modern masters keep the bass level near the top all the time, so a level threshold never fires.
    listen(analyser,targets,now){
      const n=analyser.frequencyBinCount;if(this.db?.length!==n){this.db=new Float32Array(n);this.bytes=new Uint8Array(n);this.prev=null;this.samples=new Uint8Array(analyser.fftSize)}
      if(analyser.getFloatFrequencyData)analyser.getFloatFrequencyData(this.db);else{analyser.getByteFrequencyData(this.bytes);for(let i=0;i<n;i++)this.db[i]=-100+this.bytes[i]/255*70}
      analyser.getByteTimeDomainData(this.samples);
      const hz=analyser.context.sampleRate/analyser.fftSize,db=i=>Number.isFinite(this.db[i])?this.db[i]:-120,level=(low,high)=>{let sum=0,count=0;for(let i=Math.max(1,Math.round(low/hz));i<=Math.min(n-1,Math.round(high/hz));i++){sum+=Math.min(1,Math.max(0,(db(i)+85)/55));count++}return count?sum/count:0};
      targets.bass=level(35,200);targets.mid=level(250,2500);targets.high=level(2500,10000);let sum=0;for(const value of this.samples)sum+=((value-128)/128)**2;targets.rms=Math.min(1,Math.sqrt(sum/this.samples.length)*3);
      const lo=Math.max(1,Math.round(35/hz)),hi=Math.max(lo+1,Math.round(160/hz));let flux=0;if(this.prev){for(let i=lo;i<=hi;i++){const d=db(i)-this.prev[i-lo];if(d>0)flux+=d}flux/=hi-lo+1}else this.prev=new Float32Array(hi-lo+1);for(let i=lo;i<=hi;i++)this.prev[i-lo]=db(i);
      this.flux.push(flux);if(this.flux.length>50)this.flux.shift();const mean=this.flux.reduce((a,b)=>a+b,0)/this.flux.length,std=Math.sqrt(this.flux.reduce((a,b)=>a+(b-mean)**2,0)/this.flux.length);
      if(this.flux.length>10&&flux>mean+1.3*std&&flux>.8&&now-this.lastOnset>240){this.lastOnset=now;this.onset(now,Math.min(1,(flux-mean)/(3*std+.01)))}
    }
    // Onsets lock a steady beat clock. Every tempo from 80 to 150 BPM is tried and scored by how many pairs of hits
    // land a whole number of beats apart; strong/weak beats, offbeats and missed hits all still fit the right grid.
    onset(now,strength){
      this.onsets.push(now);this.onsets=this.onsets.filter(t=>now-t<8000);const hits=this.onsets;
      if(hits.length>=8){let best=0,bestPeriod=0,pairs=0;
        for(let period=400;period<=750;period+=5){let score=0;for(let i=0;i<hits.length;i++)for(let j=i+1;j<hits.length;j++){const gap=hits[j]-hits[i];if(gap>3000)break;if(period===400)pairs++;const beats=gap/period,whole=Math.round(beats),miss=Math.abs(beats-whole);if(whole>=1&&miss<.08)score+=1-miss/.08}if(score>best){best=score;bestPeriod=period}}
        if(pairs&&best/pairs>.22){this.period=this.period&&Math.abs(this.period-bestPeriod)<this.period*.12?this.period*.75+bestPeriod*.25:bestPeriod;if(!this.locked){this.locked=true;this.nextBeatAt=now+this.period}}}
      if(this.locked){let error=now-this.nextBeatAt;while(error<-this.period/2)error+=this.period;while(error>this.period/2)error-=this.period;if(Math.abs(error)<this.period*.25)this.nextBeatAt+=error*.35;this.hit=strength}
      else this.beat(strength);
    }
    update(dt){
      const analyser=this.state==='PLAYING'?this.readAnalyser():null,targets={bass:0,mid:0,high:0,rms:0},now=performance.now();
      if(analyser)this.listen(analyser,targets,now);
      const smooth=(value,target,attack=.2,release=.65)=>value+(target-value)*(1-Math.exp(-dt/(target>value?attack:release)));
      const playing=this.state==='PLAYING';this.activity=smooth(this.activity,playing?1:0,.6,1.1);for(const key of Object.keys(this.bands))this.bands[key]=smooth(this.bands[key],targets[key],.05,.35);
      // Tempo eases toward the new track instead of jumping.
      if(!this.locked){this.targetBpm=Number(this.readBpm())||this.targetBpm||90;this.bpm+=(this.targetBpm-this.bpm)*(1-Math.exp(-dt/2.5))}
      if(this.locked&&now-this.lastOnset>4000)this.locked=false;
      if(playing&&this.locked){if(now>=this.nextBeatAt){while(this.nextBeatAt<=now)this.nextBeatAt+=this.period;this.bpm=60000/this.period;this.beat(this.hit??.5);this.hit=.35}}
      else if(playing&&!analyser){this.beatClock+=dt*this.bpm/60;if(this.beatClock>=1){this.beatClock%=1;this.beat(.45)}}
      this.beatPulse=smooth(this.beatPulse,0,.05,.16);this.kick=smooth(this.kick,0,.05,.09);
      const pace=(MOTION[this.mood]||MOTION['Спокойствие']).pace;this.phase+=dt*(.25+this.activity*.6)*pace;
      if(this.frames%30===0)this.locate();
      // Idle: a slow glide. Playing: the orbit follows the tempo and the loudness, plus the lunges left by beats.
      const tempo=this.activity*(this.bpm/120)*(.7+this.bands.rms*.6);
      for(const snake of this.snakes){const lunge=snake.lunge||0;snake.angle+=snake.dir*dt*(.22+tempo*.9+lunge*6)*snake.speed*pace;snake.lunge=lunge*Math.exp(-dt*7)}
      for(const p of this.particles)if(p.snake<0)p.angle+=dt*p.spin*(1+this.activity*1.5)*pace;
      // A snake body sits exactly on its arc, so it never cuts across the orb even when frames are slow; only the
      // push of a burst is a spring offset that settles back. Fireflies float loosely after their orbit point.
      const t=[0,0],spring=Math.exp(-dt*6),loose=Math.exp(-dt*3.2),drift=1+this.activity*3+this.bands.high*8;
      for(const p of this.particles){this.target(p,t);
        if(p.snake>=0){p.ox=((p.ox||0)+p.vx*dt);p.oy=((p.oy||0)+p.vy*dt);p.vx=(p.vx-p.ox*40*dt)*spring;p.vy=(p.vy-p.oy*40*dt)*spring;p.x=t[0]+p.ox;p.y=t[1]+p.oy;continue}
        const dx=Math.sin(this.phase*2+p.seed*40)*drift,dy=Math.cos(this.phase*1.7+p.seed*31)*drift;
        p.vx=(p.vx+(t[0]+dx-p.x)*9*dt)*loose;p.vy=(p.vy+(t[1]+dy-p.y)*9*dt)*loose;p.x+=p.vx*dt;p.y+=p.vy*dt}
    }
    // Heads are big and bright, tails fade out; fireflies twinkle with the high end.
    look(p){if(p.snake>=0){const taper=1-p.s;return {size:(.55+taper*.85)*(1+this.beatPulse*.5*taper),alpha:.25+taper*.6+this.beatPulse*.25*taper,white:p.s<.03}}
      const flicker=.55+.45*Math.sin(this.phase*6+p.seed*90);return {size:.75*(1+this.bands.high*.6*flicker),alpha:.25+flicker*.45+this.activity*.1,white:false}}
    render(){
      if(this.glState)return this.renderGl();
      if(!this.context)return;const ctx=this.context;ctx.clearRect(0,0,this.width,this.height);if(!this.sprites.length)return;
      ctx.globalCompositeOperation='lighter';const scale=this.mobile?5:6.5,visible=Math.round(this.particles.length*this.quality),last=SIZES.length-1,atlas=this.atlas;
      for(let i=0;i<visible;i++){const p=this.particles[i],look=this.look(p),size=scale*p.size*look.size,step=size<4?0:size<6?1:size<8?2:size<10.5?3:size<13.5?4:size<17?5:size<21.5?6:last,[sx,sy,sw]=this.sprites[look.white?4:p.color][step][look.alpha<.5?0:look.alpha<.8?1:2],half=sw>>1;ctx.drawImage(atlas,sx,sy,sw,sw,(p.x-half)|0,(p.y-half)|0,sw,sw)}
      ctx.globalCompositeOperation='source-over';
    }
    renderGl(){
      const state=this.glState,gl=state.gl;if(gl.isContextLost())return;gl.clear(gl.COLOR_BUFFER_BIT);if(!this.colors)return;
      const scale=(this.mobile?5:6.5)*1.25,visible=Math.round(this.particles.length*this.quality);
      if(!state.data||state.data.length<visible*FLOATS)state.data=new Float32Array(visible*FLOATS*1.25|0);const data=state.data,maxPoint=state.maxPoint/this.ratio;let o=0;
      for(let i=0;i<visible;i++){const p=this.particles[i],look=this.look(p),c=this.colors[look.white?4:p.color];data[o++]=p.x;data[o++]=p.y;data[o++]=Math.min(maxPoint,scale*p.size*look.size);data[o++]=c[0];data[o++]=c[1];data[o++]=c[2];data[o++]=Math.min(1,look.alpha)}
      gl.uniform2f(state.view,this.width,this.height);gl.uniform1f(state.ratio,this.ratio);gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,o),gl.DYNAMIC_DRAW);gl.drawArrays(gl.POINTS,0,visible);
    }
    debug(){const average=list=>list.length?list.reduce((a,b)=>a+b,0)/list.length:0;return {renderer:this.glState?'webgl':'2d',locked:this.locked,period:Math.round(this.period),onsets:this.onsets.length,state:this.state,mode:this.state==='PLAYING'&&this.readAnalyser()?'analyser':'procedural',snakes:this.snakes.length,beats:this.beats,bpm:+this.bpm.toFixed(1),particles:this.particles.length,reducedMotion:this.reduced.matches,hidden:document.hidden,running:!!this.frame,frames:this.frames,canvas:{width:this.canvas.width,height:this.canvas.height,ratio:this.ratio,mobile:this.mobile},averageDrawMs:+average(this.costs).toFixed(2),quality:+this.quality.toFixed(2),observedFps:+(1000/(average(this.intervals)||Infinity)).toFixed(1),activity:+this.activity.toFixed(3),bands:{...this.bands}}}
  }
  root.WaveBackdrop=WaveBackdrop;
})(window);
