(function(root){
  // Decorative only: receives an existing analyser and never owns playback.
  class WaveBackdrop{
    constructor(canvas,readAnalyser){
      this.canvas=canvas;this.context=canvas?.getContext('2d');this.readAnalyser=readAnalyser;this.state='IDLE';this.mood='Спокойствие';this.frame=0;this.last=0;this.phase=0;this.activity=0;this.bands={bass:0,mid:0,high:0,rms:0};this.frames=0;this.costs=[];this.intervals=[];this.reduced=root.matchMedia('(prefers-reduced-motion: reduce)');
      this.resize=()=>{if(!this.context)return;const rect=canvas.getBoundingClientRect();this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);this.mobile=this.width<768;this.ratio=Math.min(root.devicePixelRatio||1,this.mobile?1.25:1.5);canvas.width=Math.round(this.width*this.ratio);canvas.height=Math.round(this.height*this.ratio);this.context.setTransform(this.ratio,0,0,this.ratio,0,0);this.gradient=this.context.createLinearGradient(0,0,this.width,0);this.gradient.addColorStop(0,'#52ee85');this.gradient.addColorStop(.42,'#36c7cb');this.gradient.addColorStop(.72,'#8a4ef7');this.gradient.addColorStop(1,'#d85bf2');this.render();this.resume()};
      this.tick=now=>{this.frame=0;if(document.hidden||this.reduced.matches||!this.context)return;const quiet=this.state!=='PLAYING'&&this.activity<.015,interval=1000/(quiet?15:this.mobile?30:60);if(this.last&&now-this.last<interval-1){this.frame=requestAnimationFrame(this.tick);return}const dt=Math.min(.1,this.last?(now-this.last)/1000:1/60);if(this.last){this.intervals.push(now-this.last);if(this.intervals.length>180)this.intervals.shift()}this.last=now;const started=performance.now();this.update(dt);this.render();this.costs.push(performance.now()-started);if(this.costs.length>180)this.costs.shift();this.frames++;this.frame=requestAnimationFrame(this.tick)};
      this.motion=()=>{this.suspend();this.last=0;if(this.reduced.matches){this.activity=0;for(const key of Object.keys(this.bands))this.bands[key]=0;this.render()}else this.resume()};
      root.addEventListener('resize',this.resize);this.reduced.addEventListener?.('change',this.motion);document.addEventListener('visibilitychange',()=>document.hidden?this.suspend():this.resume());this.resize();
    }
    setState(state){if(this.state!==state){this.costs=[];this.intervals=[];this.last=0}this.state=state;this.resume()}
    setMood(mood){this.mood=mood;this.render()}
    suspend(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0}
    resume(){if(!this.context||document.hidden||this.reduced.matches||this.frame)return;this.frame=requestAnimationFrame(this.tick)}
    update(dt){
      const analyser=this.state==='PLAYING'?this.readAnalyser():null,targets={bass:0,mid:0,high:0,rms:0};
      if(analyser){if(this.frequency?.length!==analyser.frequencyBinCount){this.frequency=new Uint8Array(analyser.frequencyBinCount);this.samples=new Uint8Array(analyser.fftSize)}analyser.getByteFrequencyData(this.frequency);analyser.getByteTimeDomainData(this.samples);const hz=analyser.context.sampleRate/analyser.fftSize,band=(low,high)=>{let sum=0,count=0;for(let i=Math.max(1,Math.ceil(low/hz));i<Math.min(this.frequency.length,Math.ceil(high/hz));i++){sum+=this.frequency[i]/255;count++}return count?sum/count:0};targets.bass=band(40,220);targets.mid=band(220,2600);targets.high=band(2600,10000);let sum=0;for(const value of this.samples)sum+=((value-128)/128)**2;targets.rms=Math.min(1,Math.sqrt(sum/this.samples.length)*3)}
      const smooth=(value,target,attack=.2,release=.65)=>value+(target-value)*(1-Math.exp(-dt/(target>value?attack:release)));
      this.activity=smooth(this.activity,this.state==='PLAYING'?1:0,.6,1.1);for(const key of Object.keys(this.bands))this.bands[key]=smooth(this.bands[key],targets[key]);const lively=['Энергия','Вечеринка'].includes(this.mood)?1.25:['Фокус','Спокойствие'].includes(this.mood)?.75:1;this.phase+=dt*(.009+this.activity*.22)*lively;
    }
    point(x,layer){const u=x/this.width,h=this.height,depth=(layer-5)*h*.006,amplitude=h*(.045+this.activity*.018+this.bands.bass*.055),envelope=.5+.5*Math.sin(u*Math.PI),flow=Math.sin(u*Math.PI*3+this.phase+layer*.065),inner=Math.sin(u*Math.PI*6.3-this.phase*.7+layer*.13)*(h*.014+this.bands.mid*h*.018);return h*.56+depth+envelope*(flow*amplitude+inner)+Math.cos(u*Math.PI*1.6+this.phase*.32)*h*.045}
    render(){
      if(!this.context)return;const ctx=this.context,w=this.width,h=this.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle=this.gradient;const count=this.mobile?72:128,layers=this.mobile?8:14;ctx.lineWidth=1;ctx.globalCompositeOperation='screen';
      for(let layer=0;layer<layers;layer++){ctx.globalAlpha=.09+Math.sin(layer/layers*Math.PI)*(.1+this.bands.rms*.1);ctx.beginPath();for(let sample=0;sample<=count;sample++){const x=sample/count*w,y=this.point(x,layer);if(!sample)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}
      const particles=this.mobile?30:70;ctx.fillStyle=this.gradient;for(let i=0;i<particles;i++){const u=(i/particles+this.phase*.012)%1,x=u*w,y=this.point(x,(i%layers))+(Math.sin(i*3.7+this.phase)*.5)*h*.04;ctx.globalAlpha=.1+this.activity*.17+this.bands.high*.24;ctx.beginPath();ctx.arc(x,y,.7+this.bands.high*.8,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }
    debug(){const average=list=>list.length?list.reduce((a,b)=>a+b,0)/list.length:0;return {state:this.state,mode:this.state==='PLAYING'&&this.readAnalyser()?'analyser':'procedural',reducedMotion:this.reduced.matches,hidden:document.hidden,running:!!this.frame,frames:this.frames,canvas:{width:this.canvas.width,height:this.canvas.height,ratio:this.ratio,mobile:this.mobile},averageDrawMs:+average(this.costs).toFixed(2),observedFps:+(1000/(average(this.intervals)||Infinity)).toFixed(1),activity:+this.activity.toFixed(3),bands:{...this.bands}}}
  }
  root.WaveBackdrop=WaveBackdrop;
})(window);
