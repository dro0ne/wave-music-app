(function(root){
  // A quiet night sky behind the whole page: three depths of twinkling stars drifting slowly, a little
  // parallax when the page scrolls and a rare shooting star. Drawn at 30 fps; stops when hidden or turned off.
  const LAYERS=[{share:.62,size:[.6,1.2],speed:3,alpha:.7,parallax:.03},{share:.3,size:[1,1.7],speed:7,alpha:.75,parallax:.08},{share:.08,size:[1.6,2.4],speed:13,alpha:.95,parallax:.16}];
  const TINTS=['255,255,255','214,226,255','255,236,214','200,255,236'],FRAME=1000/30;
  class WaveStarfield{
    constructor(canvas){
      this.canvas=canvas;this.context=canvas?.getContext('2d');this.enabled=true;this.frame=0;this.last=0;this.drawn=0;this.time=0;this.stars=[];this.shooting=null;this.nextShot=6+Math.random()*10;
      this.reduced=root.matchMedia('(prefers-reduced-motion: reduce)');
      this.resize=()=>{if(!this.context)return;const ratio=Math.min(root.devicePixelRatio||1,1.5);this.width=root.innerWidth;this.height=root.innerHeight;canvas.width=Math.round(this.width*ratio);canvas.height=Math.round(this.height*ratio);this.context.setTransform(ratio,0,0,ratio,0,0);this.spawn();this.draw()};
      this.tick=now=>{this.frame=0;if(!this.running())return;this.frame=requestAnimationFrame(this.tick);if(now-this.drawn<FRAME*.9)return;const dt=Math.min(.1,this.last?(now-this.last)/1000:1/30);this.last=now;this.drawn=now;this.update(dt);this.draw()};
      root.addEventListener('resize',this.resize);document.addEventListener('visibilitychange',()=>this.resume());this.reduced.addEventListener?.('change',()=>{this.resize();this.resume()});
      this.resize();this.resume();
    }
    running(){return !!this.context&&this.enabled&&!document.hidden&&!this.reduced.matches}
    spawn(){const count=Math.round(Math.min(380,Math.max(90,this.width*this.height/5200))),pick=([a,b])=>a+Math.random()*(b-a);this.stars=[];
      for(const layer of LAYERS)for(let i=0;i<Math.round(count*layer.share);i++)this.stars.push({x:Math.random()*this.width,y:Math.random()*this.height,r:pick(layer.size),layer,tint:TINTS[Math.random()<.7?0:1+Math.floor(Math.random()*3)],phase:Math.random()*Math.PI*2,twinkle:.6+Math.random()*1.8})}
    update(dt){this.time+=dt;const w=this.width,h=this.height;
      // Slow drift up and to the left, like the sky turning; stars wrap around the edges.
      for(const s of this.stars){s.x-=s.layer.speed*.55*dt;s.y-=s.layer.speed*.2*dt;if(s.x<-3)s.x+=w+6;if(s.y<-3)s.y+=h+6}
      if(this.shooting){const p=this.shooting;p.t+=dt;if(p.t>p.life)this.shooting=null}
      else if((this.nextShot-=dt)<=0){this.nextShot=14+Math.random()*22;const angle=Math.PI*(.12+Math.random()*.12);this.shooting={x:w*(.25+Math.random()*.7),y:h*Math.random()*.4,dx:-Math.cos(angle),dy:Math.sin(angle),speed:520+Math.random()*260,t:0,life:.9+Math.random()*.4}}}
    draw(){const g=this.context;if(!g)return;g.clearRect(0,0,this.width,this.height);if(!this.enabled)return;const scroll=root.scrollY||0,still=this.reduced.matches;
      for(const s of this.stars){const y=((s.y-scroll*s.layer.parallax)%this.height+this.height)%this.height,flicker=still?.8:.55+.45*Math.sin(this.time*s.twinkle+s.phase);g.globalAlpha=s.layer.alpha*flicker;g.fillStyle=`rgb(${s.tint})`;
        if(s.r<1.2)g.fillRect(s.x,y,s.r,s.r);else{g.beginPath();g.arc(s.x,y,s.r/2,0,Math.PI*2);g.fill()}}
      const p=this.shooting;if(p){const fade=Math.sin(Math.PI*p.t/p.life),x=p.x+p.dx*p.speed*p.t,y=p.y+p.dy*p.speed*p.t,tail=110,gradient=g.createLinearGradient(x,y,x-p.dx*tail,y-p.dy*tail);gradient.addColorStop(0,'rgba(255,255,255,.95)');gradient.addColorStop(1,'rgba(255,255,255,0)');g.globalAlpha=fade;g.strokeStyle=gradient;g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x-p.dx*tail,y-p.dy*tail);g.stroke()}
      g.globalAlpha=1}
    setEnabled(on){this.enabled=!!on;this.canvas.hidden=!this.enabled;this.draw();this.resume()}
    resume(){if(this.running()&&!this.frame){this.last=0;this.frame=requestAnimationFrame(this.tick)}else if(!this.running()&&this.frame){cancelAnimationFrame(this.frame);this.frame=0}}
  }
  root.WaveStarfield=WaveStarfield;
})(typeof window!=='undefined'?window:globalThis);
