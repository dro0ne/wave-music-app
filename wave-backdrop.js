(function(root){
  // Decorative only: receives an existing analyser and never owns playback.
  // Glowing particles gather into shapes around the wave orb, pulse on the beat and morph between shapes.
  const TAU=Math.PI*2,rand=(a=0,b=1)=>a+Math.random()*(b-a);
  const PALETTES={'Спокойствие':['#7c6cff','#5b8cff','#9fd8ff','#c7b8ff'],'Энергия':['#ff7a3d','#ffb347','#ffe066','#ff4d6d'],'Мечтательно':['#a46bff','#6f8bff','#ff9be2','#c9b6ff'],'Фокус':['#3fd0c9','#5bc0ff','#b9ff4b','#9ff2e6'],'Романтика':['#ff5fa2','#ff8fc7','#d36bff','#ffc2dc'],'Вечеринка':['#ff4fd8','#7a5cff','#3ddcff','#b9ff4b']};
  const SHAPES={'Спокойствие':['ring','wave','moon'],'Энергия':['car','bolt','star'],'Мечтательно':['moon','cloud','star'],'Фокус':['sphere','diamond','ring'],'Романтика':['heart','hearts','ring'],'Вечеринка':['dancer','star','dancer']};
  const DANCE_POSES=[
    // [left arm up/down angle, left forearm, right arm, right forearm, left thigh, left shin, right thigh, right shin, hip sway]
    [-2.4,-.6,-.7,.5,.25,.1,-.2,.15,0],[-.6,.4,-2.5,-.5,.05,.4,-.35,-.1,.08],[-2.7,-.3,-2.7,.3,.3,-.2,-.3,.2,0],[-1.2,-1.3,-.4,.9,-.1,.6,-.3,.1,-.08],
    [-.3,.8,-2.2,-.9,.4,.0,-.05,.5,.06],[-2.2,.7,-1.0,-1.2,.15,.2,-.45,.3,-.05],[-1.6,-.8,-1.6,.8,.35,.35,-.35,.35,0],[-2.9,.2,-.5,1.1,-.25,.5,.2,.1,.1]
  ];
  // Every shape is drawn once into a small offscreen canvas and sampled into points in the range -1..1.
  function drawShape(ctx,name,s,pose){
    const c=s/2;ctx.fillStyle='#fff';ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    const heart=(x,y,r)=>{ctx.moveTo(x,y+r*.95);ctx.bezierCurveTo(x-r*1.6,y-r*.1,x-r*.9,y-r*1.25,x,y-r*.45);ctx.bezierCurveTo(x+r*.9,y-r*1.25,x+r*1.6,y-r*.1,x,y+r*.95)};
    if(name==='heart'){heart(c,c+s*.04,s*.42);ctx.fill()}
    else if(name==='hearts'){heart(c-s*.16,c+s*.02,s*.27);heart(c+s*.17,c+s*.08,s*.22);ctx.fill()}
    else if(name==='ring'){ctx.lineWidth=s*.07;ctx.arc(c,c,s*.4,0,TAU);ctx.stroke();ctx.beginPath();ctx.lineWidth=s*.025;ctx.arc(c,c,s*.27,0,TAU);ctx.stroke()}
    else if(name==='sphere'){ctx.lineWidth=s*.022;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(c,c,s*.42*Math.abs(Math.cos(i/5*Math.PI)),s*.42,0,0,TAU);ctx.stroke()}for(let i=1;i<5;i++){ctx.beginPath();let y=c-s*.42+i*s*.168,w=Math.sqrt(Math.max(0,(s*.42)**2-(y-c)**2));ctx.ellipse(c,y,w,w*.18,0,0,TAU);ctx.stroke()}}
    else if(name==='diamond'){ctx.moveTo(c,c-s*.45);ctx.lineTo(c+s*.34,c-s*.12);ctx.lineTo(c,c+s*.45);ctx.lineTo(c-s*.34,c-s*.12);ctx.closePath();ctx.lineWidth=s*.05;ctx.stroke();ctx.beginPath();ctx.moveTo(c-s*.34,c-s*.12);ctx.lineTo(c+s*.34,c-s*.12);ctx.moveTo(c,c-s*.45);ctx.lineTo(c,c+s*.45);ctx.lineWidth=s*.02;ctx.stroke()}
    else if(name==='star'){for(let i=0;i<10;i++){let r=i%2?s*.19:s*.46,a=i/10*TAU-Math.PI/2;ctx[i?'lineTo':'moveTo'](c+Math.cos(a)*r,c+Math.sin(a)*r)}ctx.closePath();ctx.fill()}
    else if(name==='moon'){ctx.arc(c,c,s*.4,0,TAU);ctx.fill();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(c+s*.17,c-s*.1,s*.34,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over'}
    else if(name==='cloud'){[[-.2,.05,.2],[0,-.08,.25],[.22,.04,.19],[.06,.1,.2],[-.32,.12,.12],[.36,.12,.12]].forEach(([x,y,r])=>{ctx.moveTo(c+x*s+r*s,c+y*s);ctx.arc(c+x*s,c+y*s,r*s,0,TAU)});ctx.fill()}
    else if(name==='wave'){ctx.lineWidth=s*.05;for(let k=0;k<3;k++){ctx.beginPath();for(let x=0;x<=s;x+=2){let y=c+(k-1)*s*.17+Math.sin(x/s*TAU*1.5+k)*s*.09;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}}
    else if(name==='bolt'){[[.58,.03],[.24,.53],[.47,.53],[.36,.97],[.78,.4],[.53,.4],[.7,.03]].forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x*s,y*s));ctx.closePath();ctx.fill()}
    else if(name==='car'){
      // A sleek sedan in profile, nose to the left: long hood, sloped roof, short trunk.
      // Headlights are painted cyan and taillights red, so their particles can glow in their own colours.
      const P=(x,y)=>[x*s,y*s],path=points=>{ctx.beginPath();points.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x*s,y*s));ctx.closePath()};
      ctx.beginPath();ctx.moveTo(...P(.05,.6));ctx.lineTo(...P(.035,.535));ctx.quadraticCurveTo(...P(.04,.49),...P(.09,.48));ctx.quadraticCurveTo(...P(.22,.455),...P(.34,.44));ctx.quadraticCurveTo(...P(.4,.36),...P(.47,.31));ctx.quadraticCurveTo(...P(.56,.285),...P(.65,.295));ctx.quadraticCurveTo(...P(.75,.33),...P(.83,.405));ctx.lineTo(...P(.93,.415));ctx.quadraticCurveTo(...P(.965,.45),...P(.96,.53));ctx.lineTo(...P(.945,.6));ctx.closePath();ctx.fill();
      ctx.globalCompositeOperation='destination-out';
      path([[.37,.435],[.465,.335],[.555,.318],[.555,.432]]);ctx.fill();path([[.575,.432],[.575,.318],[.65,.322],[.765,.405],[.74,.432]]);ctx.fill();
      [.215,.775].forEach(x=>{ctx.beginPath();ctx.arc(x*s,.6*s,.098*s,0,TAU);ctx.fill()});
      ctx.lineWidth=s*.008;ctx.beginPath();ctx.moveTo(...P(.56,.45));ctx.lineTo(...P(.565,.585));ctx.moveTo(...P(.1,.515));ctx.quadraticCurveTo(...P(.5,.49),...P(.94,.47));ctx.stroke();
      ctx.globalCompositeOperation='source-over';
      ctx.beginPath();ctx.ellipse(...P(.385,.448),.022*s,.013*s,0,0,TAU);ctx.fill();
      [.215,.775].forEach(x=>{const [cx,cy]=P(x,.6);ctx.beginPath();ctx.lineWidth=s*.024;ctx.arc(cx,cy,.072*s,0,TAU);ctx.stroke();ctx.lineWidth=s*.012;for(let k=0;k<5;k++){const a=k/5*TAU;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*.064*s,cy+Math.sin(a)*.064*s);ctx.stroke()}ctx.beginPath();ctx.arc(cx,cy,.018*s,0,TAU);ctx.fill()});
      ctx.fillStyle='#00ffff';path([[.045,.5],[.12,.478],[.145,.49],[.06,.522]]);ctx.fill();ctx.fillRect(.05*s,.548*s,.06*s,.01*s);
      ctx.fillStyle='#ff0000';path([[.905,.418],[.955,.432],[.958,.458],[.9,.45]]);ctx.fill();ctx.fillStyle='#fff'}
    else if(name==='dancer'){
      const [la,lf,ra,rf,lt,ls,rt,rs,sway]=pose||DANCE_POSES[0],hip=[c+sway*s,c+s*.1],neck=[c+sway*s*.4,c-s*.2],limb=(from,angle,len)=>[from[0]+Math.cos(angle+Math.PI/2)*len*s,from[1]+Math.sin(angle+Math.PI/2)*len*s],line=(points,w)=>{ctx.beginPath();ctx.lineWidth=w*s;points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p[0],p[1]));ctx.stroke()};
      line([hip,neck],.075);ctx.beginPath();ctx.arc(neck[0],neck[1]-s*.09,s*.065,0,TAU);ctx.fill();
      ctx.beginPath();ctx.moveTo(neck[0]+s*.04,neck[1]-s*.12);ctx.quadraticCurveTo(neck[0]+s*.15,neck[1]-s*.05,neck[0]+s*.11+sway*s,neck[1]+s*.08);ctx.lineWidth=s*.03;ctx.stroke();
      const shoulder=[neck[0],neck[1]+s*.02],le=limb(shoulder,la,.15),re=limb(shoulder,-ra,.15);line([shoulder,le,limb(le,la+lf,.13)],.035);line([shoulder,re,limb(re,-ra-rf,.13)],.035);
      ctx.beginPath();ctx.moveTo(hip[0]-s*.05,hip[1]-s*.04);ctx.lineTo(hip[0]+s*.05,hip[1]-s*.04);ctx.lineTo(hip[0]+s*.14,hip[1]+s*.11);ctx.lineTo(hip[0]-s*.14,hip[1]+s*.11);ctx.closePath();ctx.fill();
      const lk=limb(hip,lt,.17),rk=limb(hip,-rt,.17);line([hip,lk,limb(lk,lt+ls,.17)],.042);line([hip,rk,limb(rk,-rt-rs,.17)],.042)}
  }
  const FIGURES=['dancer','car'],shapeCache=new Map();
  function sampleShape(name,count,pose,poseIndex=0){
    const key=`${name}:${count}:${poseIndex}`;if(shapeCache.has(key))return shapeCache.get(key);
    const size=160,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d',{willReadFrequently:true});drawShape(ctx,name,size,pose);
    const data=ctx.getImageData(0,0,size,size).data,filled=(x,y)=>x>=0&&y>=0&&x<size&&y<size&&data[(y*size+x)*4+3]>128,accent=(x,y)=>{const i=(y*size+x)*4;return data[i]<120&&data[i+2]>180?1:data[i]>180&&data[i+1]<120?2:0},edges=[],inside=[];
    for(let y=0;y<size;y+=1)for(let x=0;x<size;x+=1){if(!filled(x,y))continue;(filled(x-2,y)&&filled(x+2,y)&&filled(x,y-2)&&filled(x,y+2)?inside:edges).push([x,y])}
    // Outlines get most particles so the shape reads clearly even behind the orb.
    const points=[],pick=list=>list[Math.floor(Math.random()*list.length)];
    // Small glowing details (headlights, taillights) get extra particles so they read as lights.
    const lights=[...edges,...inside].filter(([x,y])=>accent(x,y)),fill=name==='car'?.82:.62;
    for(let i=0;i<count;i++){const p=lights.length&&Math.random()<.09?pick(lights):(inside.length&&Math.random()>fill)||!edges.length?pick(inside.length?inside:edges):pick(edges);points.push(p?[(p[0]+Math.random()-size/2)/(size/2),(p[1]+Math.random()-size/2)/(size/2),accent(p[0],p[1])]:[0,0,0])}
    shapeCache.set(key,points);return points;
  }
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
      this.particles=[];this.shapeIndex=0;this.shapeName=null;this.poseIndex=0;this.beats=0;this.beatPulse=0;this.kick=0;this.beatClock=0;this.bpm=90;this.flux=[];this.onsets=[];this.lastOnset=0;this.period=0;this.nextBeatAt=0;this.locked=false;this.morph=1;this.morphSpeed=2;this.quality=1;this.sprites=[];this.center={x:0,y:0,r:100};
      this.resize=()=>{if(!this.context)return;const rect=canvas.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);this.mobile=this.width<768;this.ratio=Math.min(root.devicePixelRatio||1,this.mobile?1.25:1.5);canvas.width=Math.round(this.width*this.ratio);canvas.height=Math.round(this.height*this.ratio);if(this.glState)this.context.viewport(0,0,canvas.width,canvas.height);else this.context.setTransform(this.ratio,0,0,this.ratio,0,0);const count=this.mobile?900:1600;if(this.particles.length!==count)this.spawn(count);this.locate();this.render();this.resume()};
      this.enabled=true;this.tick=now=>{this.frame=0;if(document.hidden||this.reduced.matches||!this.context||!this.enabled)return;
        // Phones run at 30 fps; a frame is skipped only when it comes clearly early, so 60 Hz screens never judder.
        const target=this.mobile?30:60;if(target<50&&this.last&&now-this.last<1000/target*.75){this.frame=requestAnimationFrame(this.tick);return}
        const dt=Math.min(.1,this.last?(now-this.last)/1000:1/60);if(this.last){this.intervals.push(now-this.last);if(this.intervals.length>180)this.intervals.shift()}this.last=now;
        const started=performance.now();this.update(dt);this.render();const cost=performance.now()-started;this.costs.push(cost);if(this.costs.length>180)this.costs.shift();this.cost=this.cost?this.cost*.97+cost*.03:cost;
        if(this.frames%60===0){if(this.cost>9)this.quality=Math.max(.4,this.quality*.9);else if(this.cost<5)this.quality=Math.min(1,this.quality*1.04)}
        this.frames++;this.frame=requestAnimationFrame(this.tick)};
      this.motion=()=>{this.suspend();this.last=0;if(this.reduced.matches){this.activity=0;for(const key of Object.keys(this.bands))this.bands[key]=0;this.settle();this.render()}else this.resume()};
      root.addEventListener('resize',this.resize);if(this.glState){canvas.addEventListener('webglcontextlost',event=>event.preventDefault());canvas.addEventListener('webglcontextrestored',()=>{this.glState=createGl(canvas);this.context=this.glState?.gl||null;this.resize()})}this.reduced.addEventListener?.('change',this.motion);document.addEventListener('visibilitychange',()=>document.hidden?this.suspend():this.resume());this.palette();this.resize();this.nextShape(true);this.prewarm();if(this.reduced.matches)this.settle();
    }
    spawn(count){const old=this.particles;this.particles=Array.from({length:count},(_,i)=>old[i]||{x:rand(0,this.width||800),y:rand(0,this.height||600),vx:0,vy:0,tx:0,ty:0,seed:Math.random(),size:rand(.55,1.35),color:i%4});if(this.targets)this.assign(this.targets)}
    palette(){const colors=PALETTES[this.mood]||PALETTES['Спокойствие'];this.colors=[...colors,'#eaf6ff','#ff3a4a'].map(hexRgb);if(this.glState){this.sprites=[1];this.platform=null;if(this.particles.length)this.prewarm();return}const {atlas,cells}=buildAtlas([...colors,'#eaf6ff','#ff3a4a']);this.atlas=atlas;this.sprites=cells;
      const platform=document.createElement('canvas');platform.width=256;platform.height=56;const g=platform.getContext('2d'),grad=g.createRadialGradient(128,128,0,128,128,128);grad.addColorStop(0,colors[0]+'aa');grad.addColorStop(.35,colors[0]+'33');grad.addColorStop(1,colors[0]+'00');g.setTransform(1,0,0,.22,0,0);g.fillStyle=grad;g.fillRect(0,0,256,256);this.platform=platform;if(this.particles.length)this.prewarm()}
    // Samples the mood's shapes and all dancer poses while the browser is idle, so a shape change never stalls a frame.
    prewarm(){const idle=root.requestIdleCallback?fn=>root.requestIdleCallback(fn,{timeout:600}):fn=>setTimeout(fn,200),shapes=this.shapes(),jobs=[...shapes.filter(x=>x!=='dancer').map(x=>[x,null,0]),...(shapes.includes('dancer')?DANCE_POSES.map((pose,i)=>['dancer',pose,i]):[])],count=this.particles.length,next=()=>{const job=jobs.shift();if(!job||count!==this.particles.length)return;sampleShape(job[0],count,job[1],job[2]);idle(next)};idle(next)}
    // The figure is centred on the orb when it is visible, otherwise on the right part of the hero.
    // Outline shapes frame the orb. Figures (dancer, car) would hide behind it, so on wide screens they stand beside it.
    locate(){const canvasRect=this.canvas.getBoundingClientRect(),orb=this.anchor?.getBoundingClientRect?.(),figure=FIGURES.includes(this.shapeName);
      if(!orb||!orb.width){this.center={x:this.width*(this.mobile?.5:.72),y:Math.min(this.height*.4,300),r:Math.min(this.width,this.height)*.3};return}
      const size=Math.min(orb.width,orb.height),x=orb.left+orb.width/2-canvasRect.left,y=orb.top+orb.height/2-canvasRect.top,
        // Shapes reach about half their radius from the centre; keep them clear of the faded top edge of the canvas.
        fit=(cy,r)=>Math.min(r,Math.max(size*.9,(cy-this.height*.1)/.5));
      if(figure&&!this.mobile){const car=this.shapeName==='car',cy=y+size*(car?.32:.1);this.center={x:orb.left-canvasRect.left-size*(car?.38:.42),y:cy,r:car?size*.6:fit(cy,size*1.45)}}
      else this.center={x,y,r:this.shapeName==='car'?size*.68:fit(y,size*(this.mobile?(figure?1.55:1.25):1.6))}}
    shapes(){return SHAPES[this.mood]||SHAPES['Спокойствие']}
    nextShape(initial=false,slow=false){
      const list=this.shapes();if(!initial)this.shapeIndex=(this.shapeIndex+1)%list.length;const name=list[this.shapeIndex%list.length];this.shapeName=name;this.poseIndex=0;this.locate();
      this.targets=sampleShape(name,this.particles.length,name==='dancer'?DANCE_POSES[0]:null,0);this.assign(this.targets);this.morph=0;this.morphSpeed=slow?.45:1.4;
      if(!initial&&!slow)this.burst(.9);
    }
    nextPose(){this.poseIndex=(this.poseIndex+1)%DANCE_POSES.length;this.targets=sampleShape('dancer',this.particles.length,DANCE_POSES[this.poseIndex],this.poseIndex);this.assign(this.targets);this.morph=.7;this.morphSpeed=6}
    assign(points){this.particles.forEach((p,i)=>{const t=points[i%points.length];p.tx=t[0];p.ty=t[1];p.accent=t[2]||0})}
    settle(){this.locate();this.particles.forEach(p=>{p.x=this.center.x+p.tx*this.center.r;p.y=this.center.y+p.ty*this.center.r;p.vx=p.vy=0});this.morph=1}
    burst(strength){const {x,y}=this.center;for(const p of this.particles){const dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy)||1,force=strength*rand(90,260);p.vx+=dx/d*force-dy/d*force*.35;p.vy+=dy/d*force+dx/d*force*.35}}
    // Called by the app when a new track starts: the figure slowly flows into the next shape and the tempo eases over.
    trackChanged(bpm){if(Number(bpm)>0)this.targetBpm=Number(bpm);this.onsets=[];this.locked=false;this.nextShape(false,true)}
    setState(state){if(this.state!==state){this.costs=[];this.intervals=[];this.last=0}this.state=state;this.resume()}
    setMood(mood){if(mood===this.mood)return;this.mood=mood;this.palette();this.shapeIndex=-1;this.nextShape(false,true);this.render()}
    suspend(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0}
    resume(){if(!this.context||!this.enabled||document.hidden||this.reduced.matches||this.frame)return;this.frame=requestAnimationFrame(this.tick)}
    // The particles can be switched off in settings; the canvas is hidden and stops drawing entirely.
    setEnabled(on){this.enabled=!!on;if(this.canvas)this.canvas.hidden=!this.enabled;if(this.enabled){this.last=0;this.resume()}else this.suspend()}
    beat(strength){this.beats++;this.beatPulse=Math.min(1.3,.7+strength*.6);this.kick=1;const dancer=this.shapeName==='dancer';if(!FIGURES.includes(this.shapeName))this.burst(.06+strength*.12);if(dancer)this.nextPose();if(this.beats%(dancer?32:16)===0)this.nextShape()}
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
      else if(!playing){this.beatClock+=dt/4;if(this.beatClock>=1){this.beatClock%=1;this.beats+=1;if(this.beats%3===0)this.nextShape(false,true)}}
      this.beatPulse=smooth(this.beatPulse,0,.05,.16);this.kick=smooth(this.kick,0,.05,.09);this.morph=Math.min(1,this.morph+dt*this.morphSpeed);
      const lively=['Энергия','Вечеринка'].includes(this.mood)?1.25:['Фокус','Спокойствие'].includes(this.mood)?.75:1;this.phase+=dt*(.25+this.activity*.6)*lively;
      if(this.frames%30===0)this.locate();
      const figure=FIGURES.includes(this.shapeName),car=this.shapeName==='car',cx=this.center.x,cy=this.center.y+(car?Math.sin(this.kick*Math.PI)*this.center.r*.035:0),r=this.center.r*(1+this.beatPulse*(figure?.04:.1)+this.bands.rms*.04),stiffness=(4+this.morph*18+this.activity*8)*(this.morphSpeed<1?.55:figure?1.6:1),damping=Math.exp(-dt*(this.morphSpeed<1?2.4:figure?6:3.6)),drift=(2+this.activity*6+this.bands.high*14)*(figure?.3:1);
      for(const p of this.particles){const wobble=Math.sin(this.phase*2+p.seed*40)*drift,tx=cx+p.tx*r+wobble,ty=cy+p.ty*r+Math.cos(this.phase*1.7+p.seed*31)*drift;p.vx=(p.vx+(tx-p.x)*stiffness*dt)*damping;p.vy=(p.vy+(ty-p.y)*stiffness*dt)*damping;p.x+=p.vx*dt;p.y+=p.vy*dt}
    }
    render(){
      if(this.glState)return this.renderGl();
      if(!this.context)return;const ctx=this.context;ctx.clearRect(0,0,this.width,this.height);if(!this.sprites.length)return;
      const {x:cx,y:cy,r}=this.center,energy=this.activity,glow=.25+energy*.25+this.beatPulse*.5;
      // A soft glowing "platform" under the figure, like a stage light; pre-rendered once per mood.
      ctx.globalAlpha=Math.min(1,glow);ctx.drawImage(this.platform,cx-r,cy+r*1.12-r*.22,r*2,r*.44);ctx.globalAlpha=1;
      ctx.globalCompositeOperation='lighter';const twinkle=this.bands.high,scale=this.mobile?5:6.5;
      const visible=Math.round(this.particles.length*this.quality),last=SIZES.length-1,atlas=this.atlas;for(let i=0;i<visible;i++){const p=this.particles[i],flicker=.55+.45*Math.sin(this.phase*6+p.seed*90),size=scale*p.size*(1+this.beatPulse*.55+twinkle*.4*flicker),alpha=.5+energy*.2+flicker*.25+this.beatPulse*.3,step=size<4?0:size<6?1:size<8?2:size<10.5?3:size<13.5?4:size<17?5:size<21.5?6:last,[sx,sy,sw]=p.accent?this.sprites[3+p.accent][Math.min(last,step+1)][2]:this.sprites[p.color][step][alpha<.62?0:alpha<.88?1:2],half=sw>>1;ctx.drawImage(atlas,sx,sy,sw,sw,(p.x-half)|0,(p.y-half)|0,sw,sw)}
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }
    renderGl(){
      const state=this.glState,gl=state.gl;if(gl.isContextLost())return;gl.clear(gl.COLOR_BUFFER_BIT);if(!this.colors)return;
      const {x:cx,y:cy,r}=this.center,energy=this.activity,twinkle=this.bands.high,scale=(this.mobile?5:6.5)*1.25,visible=Math.round(this.particles.length*this.quality),platform=24,total=visible+platform;
      if(!state.data||state.data.length<total*FLOATS)state.data=new Float32Array(total*FLOATS*1.25|0);const data=state.data,maxPoint=state.maxPoint/this.ratio;let o=0;
      // The stage-light "platform" under the figure: a row of large, faint glows.
      const glow=.25+energy*.25+this.beatPulse*.5,base=this.colors[0];for(let i=0;i<platform;i++){const u=i/(platform-1)*2-1;data[o++]=cx+u*r*.8;data[o++]=cy+r*1.12;data[o++]=Math.min(maxPoint,r*(.42-Math.abs(u)*.22));data[o++]=base[0];data[o++]=base[1];data[o++]=base[2];data[o++]=glow*.16*(1-Math.abs(u)*.6)}
      for(let i=0;i<visible;i++){const p=this.particles[i],flicker=.55+.45*Math.sin(this.phase*6+p.seed*90),size=scale*p.size*(1+this.beatPulse*.55+twinkle*.4*flicker)*(p.accent?1.5:1),alpha=Math.min(1,(.5+energy*.2+flicker*.25+this.beatPulse*.3)*.75),c=this.colors[p.accent?3+p.accent:p.color];
        data[o++]=p.x;data[o++]=p.y;data[o++]=Math.min(maxPoint,size);data[o++]=c[0];data[o++]=c[1];data[o++]=c[2];data[o++]=p.accent?1:alpha}
      gl.uniform2f(state.view,this.width,this.height);gl.uniform1f(state.ratio,this.ratio);gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,o),gl.DYNAMIC_DRAW);gl.drawArrays(gl.POINTS,0,total);
    }
    debug(){const average=list=>list.length?list.reduce((a,b)=>a+b,0)/list.length:0;return {renderer:this.glState?'webgl':'2d',locked:this.locked,period:Math.round(this.period),onsets:this.onsets.length,state:this.state,mode:this.state==='PLAYING'&&this.readAnalyser()?'analyser':'procedural',shape:this.shapeName,pose:this.poseIndex,beats:this.beats,bpm:+this.bpm.toFixed(1),particles:this.particles.length,reducedMotion:this.reduced.matches,hidden:document.hidden,running:!!this.frame,frames:this.frames,canvas:{width:this.canvas.width,height:this.canvas.height,ratio:this.ratio,mobile:this.mobile},averageDrawMs:+average(this.costs).toFixed(2),quality:+this.quality.toFixed(2),observedFps:+(1000/(average(this.intervals)||Infinity)).toFixed(1),activity:+this.activity.toFixed(3),bands:{...this.bands}}}
  }
  root.WaveBackdrop=WaveBackdrop;
})(window);
