(function(root){
  // Official embedded players of other services: YouTube (IFrame Player API) and SoundCloud (Widget API).
  // EmbedElement stands in for <audio> the same way WaveSpotifyPlayer.Element does: src is a "youtube:<id>" or
  // "soundcloud:<track url>" URI, and play/pause/currentTime/volume/on* events map to the player's own API.
  // The service plays the music itself; the Wave never touches the audio, so there is no EQ or analyser for these.
  // Players stay visible while they play (YouTube requires it): a small dock, or over the artwork in the full player.
  // Yandex Music's widget has no control API, so it only opens in the dock and the listener presses play in it.
  const HANDLERS=['onplay','onplaying','onpause','onended','onerror','onwaiting','onstalled','oncanplay','oncanplaythrough','onloadeddata','onloadedmetadata','ontimeupdate','onseeking','onseeked'];
  const PREFIX={youtube:'youtube:',soundcloud:'soundcloud:'},LABEL={youtube:'YouTube',soundcloud:'SoundCloud',yandex:'Яндекс Музыка'};
  const kindOf=value=>typeof value!=='string'?'':Object.keys(PREFIX).find(kind=>value.startsWith(PREFIX[kind]))||'';
  const idOf=value=>value.slice(PREFIX[kindOf(value)].length);
  const quiet=fn=>{try{const value=fn();if(value?.catch)value.catch(()=>{})}catch{}};
  function addScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=true;script.onload=resolve;script.onerror=()=>{script.remove();reject(Error(`${src} did not load`))};document.head.append(script)})}

  // ---- dock -------------------------------------------------------------------------------------------------
  const dock={el:null,kind:'',
    build(){
      if(this.el)return this.el;
      const el=document.createElement('section');el.className='embed-dock';el.setAttribute('aria-label','Плеер сервиса');el.hidden=true;
      el.innerHTML='<header><b></b><button type="button" class="embed-close" aria-label="Закрыть плеер сервиса">×</button></header><div class="embed-slot" data-kind="youtube"><div id="waveYoutubeHost"></div></div><div class="embed-slot" data-kind="soundcloud"></div><div class="embed-slot" data-kind="yandex"></div><p class="embed-note"></p>';
      el.querySelector('.embed-close').onclick=()=>{if(this.kind==='yandex'){this.yandexClose();return}for(const element of Object.values(owners))element?.pause();this.hide()};
      document.body.append(el);this.el=el;
      // The full player slides in, so its artwork is measured again once the slide has finished.
      const place=()=>{this.place();setTimeout(()=>this.place(),380);setTimeout(()=>this.place(),800)},full=document.getElementById('fullPlayer');
      root.addEventListener('resize',place);full?.addEventListener('transitionend',()=>this.place());full?.querySelector('.full-player-body')?.addEventListener('scroll',()=>this.place(),{passive:true});
      new MutationObserver(place).observe(full||document.body,{attributes:true,attributeFilter:['aria-hidden','class','style']});
      return el;
    },
    slot(kind){return this.build().querySelector(`.embed-slot[data-kind="${kind}"]`)},
    show(kind,note=''){const el=this.build();this.kind=kind;el.hidden=false;el.dataset.kind=kind;el.querySelector('header b').textContent=LABEL[kind];el.querySelector('.embed-note').textContent=note;for(const slot of el.querySelectorAll('.embed-slot'))slot.hidden=slot.dataset.kind!==kind;this.place()},
    hide(){if(this.el){this.el.hidden=true;this.kind=''}},
    // Over the artwork when the full player is open, a corner dock otherwise.
    place(){
      const el=this.el;if(!el||el.hidden)return;
      const full=document.getElementById('fullPlayer'),open=!!full&&full.getAttribute('aria-hidden')==='false',art=open?full.querySelector('.full-artwork'):null;
      const rect=art?.getBoundingClientRect();
      if(rect&&rect.width>=200){el.classList.add('over-artwork');Object.assign(el.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'})}
      else{el.classList.remove('over-artwork');el.style.left=el.style.top=el.style.width=el.style.height=''}
    },
    yandex(url){
      const match=String(url).match(/album\/(\d+)\/track\/(\d+)/)||String(url).match(/track\/(\d+)/);if(!match)return false;
      const [album,track]=match.length===3?[match[1],match[2]]:['',match[1]],slot=this.slot('yandex');
      slot.innerHTML='';const frame=document.createElement('iframe');frame.allow='autoplay; encrypted-media';frame.loading='eager';frame.title='Яндекс Музыка';
      frame.src=`https://music.yandex.ru/iframe/track/${track}${album?'/'+album:''}`;slot.append(frame);
      this.show('yandex','Нажми ▶ в плеере Яндекса. Целиком трек играет, если ты вошёл в Яндекс в этом браузере и у тебя есть Плюс');return true;
    },
    yandexClose(){const slot=this.slot('yandex');slot.innerHTML='';this.hide()}
  };

  // ---- drivers ----------------------------------------------------------------------------------------------
  // A driver wraps one service's player: load(id, seconds), play, pause, seek(seconds), volume(0..1),
  // snapshot() -> {position, duration} in seconds; it reports 'playing' | 'paused' | 'ended' | 'waiting' | 'error'
  // to whichever element owns it now.
  const drivers={},owners={};
  function youtubeDriver(){
    return drivers.youtube||=(async()=>{
      if(!root.YT?.Player){const loaded=new Promise(resolve=>{const previous=root.onYouTubeIframeAPIReady;root.onYouTubeIframeAPIReady=()=>{previous?.();resolve()}});await addScript('https://www.youtube.com/iframe_api');await loaded}
      dock.build();
      const self={kind:'youtube',report:null};
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('YouTube player timeout')),15000);
        self.player=new root.YT.Player('waveYoutubeHost',{width:'100%',height:'100%',playerVars:{playsinline:1,controls:0,rel:0,modestbranding:1,disablekb:1,iv_load_policy:3,origin:location.origin},
          events:{onReady:()=>{clearTimeout(timer);resolve()},
            onStateChange:event=>self.report?.({0:'ended',1:'playing',2:'paused',3:'waiting'}[event.data]),
            onError:event=>self.report?.('error',{101:'Автор запретил встраивание этого видео',150:'Автор запретил встраивание этого видео',100:'Видео удалено',2:'Неверный адрес видео',5:'Видео не играет во встроенном плеере'}[event.data]||`YouTube error ${event.data}`)}});
      });
      const p=self.player;
      Object.assign(self,{load:(id,seconds)=>p.loadVideoById({videoId:id,startSeconds:seconds||0}),play:()=>p.playVideo(),pause:()=>p.pauseVideo(),seek:seconds=>p.seekTo(seconds,true),volume:value=>p.setVolume(Math.round(value*100)),stop:()=>p.stopVideo(),
        snapshot:()=>({position:p.getCurrentTime?.()||0,duration:p.getDuration?.()||NaN})});
      return self;
    })().catch(error=>{drivers.youtube=null;throw error});
  }
  function soundcloudDriver(){
    return drivers.soundcloud||=(async()=>{
      if(!root.SC?.Widget)await addScript('https://w.soundcloud.com/player/api.js');
      const self={kind:'soundcloud',report:null,widget:null,position:0,duration:NaN,frame:null};
      const widgetUrl=url=>`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
      const bind=()=>{const W=root.SC.Widget.Events,w=self.widget;
        w.bind(W.PLAY,()=>{w.getDuration(ms=>{self.duration=ms/1000});self.report?.('playing')});
        w.bind(W.PAUSE,()=>self.report?.('paused'));w.bind(W.FINISH,()=>self.report?.('ended'));
        w.bind(W.ERROR,()=>self.report?.('error','SoundCloud не смог включить трек'));
        w.bind(W.PLAY_PROGRESS,event=>{self.position=(event.currentPosition||0)/1000})};
      Object.assign(self,{
        load(url,seconds){
          self.position=seconds||0;self.duration=NaN;
          const seekAfterStart=()=>{if(seconds>1)self.widget.seekTo(Math.round(seconds*1000))};
          if(!self.widget){
            const frame=document.createElement('iframe');frame.allow='autoplay';frame.title='SoundCloud';frame.src=widgetUrl(url);dock.slot('soundcloud').append(frame);self.frame=frame;
            self.widget=root.SC.Widget(frame);self.widget.bind(root.SC.Widget.Events.READY,()=>{bind();seekAfterStart()});
          }else self.widget.load(url,{auto_play:true,show_comments:false,visual:true,hide_related:true,callback:seekAfterStart});
        },
        play:()=>self.widget?.play(),pause:()=>self.widget?.pause(),seek:seconds=>{self.position=seconds;self.widget?.seekTo(Math.round(seconds*1000))},
        volume:value=>self.widget?.setVolume(Math.round(value*100)),stop:()=>self.widget?.pause(),
        snapshot:()=>({position:self.position,duration:self.duration})});
      return self;
    })().catch(error=>{drivers.soundcloud=null;throw error});
  }
  const driverFor=kind=>kind==='youtube'?youtubeDriver():soundcloudDriver();

  // ---- element ----------------------------------------------------------------------------------------------
  class EmbedElement{
    constructor(){
      this.dataset={};this.preload='auto';this.crossOrigin=null;this.paused=true;this.ended=false;this.readyState=0;this.networkState=0;this.duration=NaN;this.error=null;this.buffered={length:0};
      this._src='';this._volume=1;this._position=0;this._at=0;this._started=false;this._announced=false;this._driver=null;this._timer=null;
      for(const name of HANDLERS)this[name]=null;
    }
    get kind(){return kindOf(this._src)}
    get src(){return this._src}
    set src(value){value=String(value||'');if(value===this._src)return;this._halt();this._src=value;this.readyState=0;this.ended=false;this.error=null;this._position=0;this.duration=NaN}
    get currentTime(){if(this.paused||!this._started)return this._position;const limit=Number.isFinite(this.duration)?this.duration:Infinity;return Math.min(limit,this._position+(performance.now()-this._at)/1000)}
    set currentTime(value){this._position=Math.max(0,Number(value)||0);this._at=performance.now();if(this._owns())quiet(()=>this._driver.seek(this._position))}
    get volume(){return this._volume}
    set volume(value){this._volume=Math.max(0,Math.min(1,Number(value)||0));if(this._owns())quiet(()=>this._driver.volume(this._volume))}
    setAttribute(){}
    removeAttribute(name){if(name==='src'){this._halt();this._src=''}}
    load(){if(!this._src)this._halt()}
    _owns(){return !!this._driver&&owners[this.kind]===this&&this._started}
    async play(){
      const kind=this.kind;if(!kind)throw new DOMException('Not an embedded track','NotSupportedError');
      if(!this.paused&&this._owns())return;
      this.paused=false;this.ended=false;this.error=null;this._emit('onplay');
      try{
        const driver=await driverFor(kind);if(this.paused||this.kind!==kind)return;
        const previous=owners[kind];owners[kind]=this;if(previous&&previous!==this)previous._lost();
        this._driver=driver;driver.report=(state,detail)=>{if(owners[kind]===this)this._on(state,detail)};
        dock.show(kind);driver.volume(this._volume);
        if(this._started)driver.play();else{this._started=true;this._announced=false;driver.load(idOf(this._src),this._position)}
        this._at=performance.now();this._tick();
      }catch(error){
        this.paused=true;this._started=false;if(owners[kind]===this)owners[kind]=null;this.error={code:4,message:error.message};
        throw new DOMException(error.message,'NotSupportedError');
      }
    }
    pause(){if(this.paused)return;this._position=this.currentTime;this.paused=true;this._announced=false;if(this._owns())quiet(()=>this._driver.pause());this._emit('onpause')}
    _on(state,detail){
      if(state==='playing'){
        this._sync();
        if(!this._announced){this._announced=true;if(this.readyState<4){this.readyState=4;this._emit('onloadedmetadata');this._emit('oncanplay')}if(this.paused){this.paused=false;this._emit('onplay')}this._emit('onplaying')}
      }else if(state==='paused'){if(!this.paused){this._sync();this.paused=true;this._announced=false;this._emit('onpause')}}
      else if(state==='waiting'){this._announced=false;this._emit('onwaiting')}
      else if(state==='ended')this._finish();
      else if(state==='error'){this.error={code:4,message:detail||'error'};this.paused=true;this._started=false;if(owners[this.kind]===this)owners[this.kind]=null;this._emit('onerror')}
    }
    _sync(){if(!this._driver)return;const {position,duration}=this._driver.snapshot();if(Number.isFinite(position))this._position=position;this._at=performance.now();if(duration>0&&this.duration!==duration)this.duration=duration}
    _tick(){clearInterval(this._timer);this._timer=setInterval(()=>{if(!this._owns()||this.paused){clearInterval(this._timer);this._timer=null;return}this._sync();this._emit('ontimeupdate')},500)}
    _finish(){this._position=Number.isFinite(this.duration)?this.duration:this._position;this.paused=true;this.ended=true;this._started=false;if(owners[this.kind]===this)owners[this.kind]=null;this._emit('onended')}
    _lost(){const was=!this.paused;this._position=this.currentTime;this.paused=true;this._started=false;this._announced=false;if(was)this._emit('onpause')}
    _halt(){const kind=this.kind;if(kind&&owners[kind]===this){owners[kind]=null;if(this._started&&this._driver)quiet(()=>this._driver.stop());if(dock.kind===kind)dock.hide()}this._position=this.currentTime;this.paused=true;this._started=false;this._announced=false;clearInterval(this._timer);this._timer=null}
    _emit(name){const handler=this[name];if(typeof handler!=='function')return;try{handler.call(this,{type:name.slice(2),target:this})}catch(error){console.error(error)}}
  }

  root.WaveEmbeds={Element:EmbedElement,kindOf,idOf,isUri:value=>!!kindOf(value),isElement:value=>value instanceof EmbedElement,label:kind=>LABEL[kind]||kind,
    openYandex:url=>dock.yandex(url),place:()=>dock.place()};
})(typeof window!=='undefined'?window:globalThis);
