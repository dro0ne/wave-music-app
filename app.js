const MOODS=[['Спокойствие','☁',64,'#7056db'],['Энергия','ϟ',124,'#e8643e'],['Фокус','◎',82,'#318d91'],['Мечтательно','☾',70,'#8b57d8'],['Вечеринка','✦',132,'#d64c9b']];
const GENRE_PAIRS=[
['Поп','Pop'],['Дэнс-поп','Dance Pop'],['Синти-поп','Synthpop'],['Инди-поп','Indie Pop'],['Дрим-поп','Dream Pop'],['Арт-поп','Art Pop'],['K-pop','K-Pop'],['J-pop','J-Pop'],['Гиперпоп','Hyperpop'],['Европоп','Europop'],
['Рок','Rock'],['Альтернатива','Alternative'],['Инди-рок','Indie Rock'],['Классический рок','Classic Rock'],['Хард-рок','Hard Rock'],['Психоделический рок','Psychedelic Rock'],['Прогрессивный рок','Progressive Rock'],['Гаражный рок','Garage Rock'],['Пост-рок','Post-Rock'],['Сёрф-рок','Surf Rock'],['Софт-рок','Soft Rock'],['Панк','Punk'],['Поп-панк','Pop Punk'],['Пост-панк','Post-Punk'],['Хардкор','Hardcore'],['Эмо','Emo'],['Гранж','Grunge'],['Шугейз','Shoegaze'],
['Метал','Metal'],['Хэви-метал','Heavy Metal'],['Трэш-метал','Thrash Metal'],['Дэт-метал','Death Metal'],['Блэк-метал','Black Metal'],['Дум-метал','Doom Metal'],['Пауэр-метал','Power Metal'],['Металкор','Metalcore'],['Ню-метал','Nu Metal'],['Симфоник-метал','Symphonic Metal'],
['Хип-хоп','Hip-Hop/Rap'],['Рэп','Rap'],['Русский рэп','Russian Rap'],['Русский хип-хоп','Russian Hip-Hop'],['Трэп','Trap'],['Дрилл','Drill'],['Бум-бэп','Boom Bap'],['Грайм','Grime'],['Фонк','Phonk'],['Клауд-рэп','Cloud Rap'],['Альтернативный хип-хоп','Alternative Hip-Hop'],['Олдскул-рэп','Old School Rap'],
['Электроника','Electronic'],['EDM','EDM'],['Хаус','House'],['Дип-хаус','Deep House'],['Тек-хаус','Tech House'],['Прогрессив-хаус','Progressive House'],['Эйсид-хаус','Acid House'],['Техно','Techno'],['Детройт-техно','Detroit Techno'],['Минимал-техно','Minimal Techno'],['Транс','Trance'],['Психоделик-транс','Psytrance'],['Дабстеп','Dubstep'],['Драм-н-бейс','Drum & Bass'],['Джангл','Jungle'],['Брейкбит','Breakbeat'],['Гэридж','UK Garage'],['Хардстайл','Hardstyle'],['Хардкор-техно','Hardcore Techno'],['Даунтемпо','Downtempo'],['Трип-хоп','Trip-Hop'],['IDM','IDM'],['Глитч','Glitch'],['Чилвейв','Chillwave'],['Вейпорвейв','Vaporwave'],['Синтвейв','Synthwave'],['Электро','Electro'],['Электросвинг','Electro Swing'],
['R&B','R&B/Soul'],['Соул','Soul'],['Нео-соул','Neo Soul'],['Фанк','Funk'],['Диско','Disco'],['Госпел','Gospel'],['Мотаун','Motown'],
['Джаз','Jazz'],['Свинг','Swing'],['Бибоп','Bebop'],['Фьюжн','Jazz Fusion'],['Смус-джаз','Smooth Jazz'],['Лаунж','Lounge'],['Блюз','Blues'],['Ритм-н-блюз','Rhythm and Blues'],
['Классика','Classical'],['Неоклассика','Neoclassical'],['Барокко','Baroque'],['Опера','Opera'],['Симфоническая','Symphonic'],['Камерная музыка','Chamber Music'],['Фортепиано','Piano'],['Хоровая музыка','Choral'],
['Фолк','Folk'],['Инди-фолк','Indie Folk'],['Фолк-рок','Folk Rock'],['Кантри','Country'],['Блюграсс','Bluegrass'],['Американа','Americana'],['Акустика','Acoustic'],['Авторская песня','Singer-Songwriter'],
['Регги','Reggae'],['Даб','Dub'],['Ска','Ska'],['Дэнсхолл','Dancehall'],['Латино','Latin'],['Реггетон','Reggaeton'],['Сальса','Salsa'],['Бачата','Bachata'],['Самба','Samba'],['Босса-нова','Bossa Nova'],['Танго','Tango'],['Афробит','Afrobeats'],['Амапиано','Amapiano'],['Хайлайф','Highlife'],
['Мировая музыка','World'],['Арабская музыка','Arabic'],['Индийская музыка','Indian'],['Болливуд','Bollywood'],['Африканская музыка','African'],['Кельтская музыка','Celtic'],['Балканская музыка','Balkan'],['Русская музыка','Russian'],
['Лоу-фай','Lo-Fi'],['Эмбиент','Ambient'],['Дарк-эмбиент','Dark Ambient'],['Нью-эйдж','New Age'],['Медитация','Meditation'],['Для сна','Sleep'],['Для фокуса','Focus'],['Для тренировок','Workout'],['Релакс','Relaxation'],['Природа','Nature'],
['Саундтреки','Soundtrack'],['Музыка из игр','Video Game Music'],['Музыка из аниме','Anime'],['Мюзикл','Musical'],['Оркестровая','Orchestral'],['Эпическая музыка','Epic'],['Трейлерная музыка','Trailer Music'],
['Экспериментальная','Experimental'],['Авангард','Avant-Garde'],['Индастриал','Industrial'],['Нойз','Noise'],['Дроун','Drone'],['Чиптюн','Chiptune'],['8-бит','8-Bit'],['Споукен-ворд','Spoken Word'],['Подкасты','Podcasts'],['Комедия','Comedy'],['Детская музыка','Kids']];
const GENRES=GENRE_PAIRS.map(x=>x[0]);
const TITLES=['Неоновый дождь','Выше облаков','Тихий город','После полуночи','Новый горизонт','Тёплый свет','Импульс','Вне времени','Линии'];
const ARTISTS=['Luma','Northline','Mira Vee','Slow Frames','Nova Room','Aster','Low Tide'];
let state=JSON.parse(localStorage.getItem('waveState')||'null')||{mood:'Спокойствие',genres:['Поп','Электроника'],discovery:50,likes:[],history:[]};
state.likes ||= []; state.history ||= []; state.dislikes ||= []; state.taste ||= {genres:{},artists:{}};
let queue=[],index=0,playing=false,elapsed=0,timer,audio,media,retuneTimer;
let genreQuery='';
const tabChannel='BroadcastChannel'in window?new BroadcastChannel('wave-player'):null;
const $=s=>document.querySelector(s), save=()=>localStorage.setItem('waveState',JSON.stringify(state));
function paintRange(input){input.style.setProperty('--value',`${(input.value-input.min)/(input.max-input.min)*100}%`)}
document.querySelectorAll('input[type="range"]').forEach(input=>{paintRange(input);input.addEventListener('input',()=>paintRange(input))});
function choices(){
  let genreScroll=$('#genres')?.scrollTop||0;
  $('#moods').innerHTML=MOODS.map(m=>`<button class="mood ${state.mood===m[0]?'selected':''}" data-mood="${m[0]}" aria-pressed="${state.mood===m[0]}"><b>${m[1]}</b><span>${m[0]}</span></button>`).join('');
  let visible=GENRES.filter(g=>g.toLocaleLowerCase('ru').includes(genreQuery));
  $('#genres').innerHTML=visible.length?visible.map(g=>`<button class="genre ${state.genres.includes(g)?'selected':''}" data-genre="${g}" aria-pressed="${state.genres.includes(g)}">${g}</button>`).join(''):'<span class="genre-empty">Такого жанра пока нет</span>';
  $('#genreCount').textContent=genreQuery?`найдено: ${visible.length}`:`выбирай несколько · ${GENRES.length} направлений`;
  $('#genres').scrollTop=genreScroll;
  $('#hint').textContent=`${state.mood} · ${state.genres.join(', ')||'Любые жанры'}`;
}
$('#moods').onclick=e=>{let b=e.target.closest('[data-mood]');if(b&&state.mood!==b.dataset.mood){state.mood=b.dataset.mood;save();choices();scheduleRetune('Настроение изменено — перестраиваем волну')}};
$('#genres').onclick=e=>{let b=e.target.closest('[data-genre]');if(!b)return;let g=b.dataset.genre;state.genres=state.genres.includes(g)?state.genres.filter(x=>x!==g):[...state.genres,g];save();choices();scheduleRetune('Жанры изменены — перестраиваем волну')};
$('#genreSearch').oninput=e=>{genreQuery=e.target.value.trim().toLocaleLowerCase('ru');choices()};
$('#discovery').value=state.discovery;paintRange($('#discovery'));
$('#discovery').oninput=e=>{state.discovery=+e.target.value;$('#discoverText').textContent=state.discovery<35?'В основном музыка, похожая на любимую':state.discovery>65?'Больше незнакомых исполнителей':'Поровну знакомого и новых открытий';save()};
$('#discovery').onchange=()=>scheduleRetune(state.discovery>65?'Ищем свежие релизы':'Обновляем баланс подборки');
function fallbackQueue(){let m=MOODS.find(x=>x[0]===state.mood)||MOODS[0];return Array.from({length:9},(_,i)=>({title:TITLES[(i+Math.floor(Math.random()*9))%9],artist:ARTISTS[Math.floor(Math.random()*7)],genre:state.genres[i%Math.max(1,state.genres.length)]||'Разное',mood:m[0],tempo:m[2]+(i%3-1)*5,color:m[3],duration:105+(i*13)%76,reason:'Локальный демо-режим'}))}
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const genreMap=Object.fromEntries(GENRE_PAIRS);
const moodMap={'Спокойствие':['peaceful','chill','cool','relaxing'],'Энергия':['energizing','fiery','excited','upbeat'],'Фокус':['focused','sophisticated','serious'],'Мечтательно':['dreamy','romantic','sentimental','yearning'],'Вечеринка':['party','excited','upbeat','energizing']};
function learn(track,value){if(!track)return;state.taste.genres[track.genre]=(state.taste.genres[track.genre]||0)+value;state.taste.artists[track.artist]=(state.taste.artists[track.artist]||0)+value;save()}
function normalize(t,m){return {id:t.id,title:t.title,artist:t.user?.name||t.artist||'Audius Artist',genre:t.genre||'Разное',mood:t.mood||m[0],tempo:m[2],color:m[3],duration:t.duration||180,artwork:t.artwork?.['480x480']||t.artwork,stream:t.id?`https://api.audius.co/v1/tracks/${t.id}/stream`:t.stream,releaseDate:t.release_date||t.releaseDate,reason:t._reason||t.reason||'Подобрано для тебя'}}
function releaseLabel(value){if(!value)return '';let date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
async function buildQueue(){
  let m=MOODS.find(x=>x[0]===state.mood)||MOODS[0];
  try{
    let stamp=Date.now(),genreRequests=state.genres.slice(0,4).map(label=>[label,genreMap[label]||label]);
    let urls=[`https://api.audius.co/v1/tracks/trending?limit=50&_=${stamp}`,`https://api.audius.co/v1/tracks/latest?limit=50&_=${stamp}`,`https://api.audius.co/v1/tracks/feeling-lucky?limit=25&_=${stamp}`,...genreRequests.map(([,query])=>`https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=12&_=${stamp}`)];
    let results=await Promise.all(urls.map(u=>fetch(u,{signal:AbortSignal.timeout(9000)}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).catch(()=>({data:[]}))));
    let trending=results[0].data||[],latest=results[1].data||[],lucky=results[2].data||[];
    let matched=results.slice(3).flatMap((result,i)=>(result.data||[]).map(t=>({...t,_reason:`Выбран жанр: ${genreRequests[i][0]}`})));
    if(!trending.length&&!latest.length)throw Error('Каталог временно недоступен');
    let wanted=state.genres.map(g=>genreMap[g]).filter(Boolean),wantedMoods=moodMap[state.mood]||[],seenArtists=new Set(state.history.map(x=>x.artist)),blocked=new Set(state.dislikes);
    let score=t=>(wanted.some(g=>(t.genre||'').toLowerCase().includes(g.toLowerCase()))?6:0)+(wantedMoods.some(x=>(t.mood||'').toLowerCase().includes(x))?4:0)+(state.taste.genres[t.genre]||0)+(state.taste.artists[t.user?.name]||0)+Math.random()*2;
    trending=shuffle(trending).sort((a,b)=>score(b)-score(a)).map(t=>({...t,_reason:'По твоим жанрам'}));
    let cutoff=Date.now()-45*24*60*60*1000,datedLatest=latest.filter(t=>{let d=new Date(t.release_date).getTime();return Number.isFinite(d)&&d>=cutoff&&d<=Date.now()+86400000});
    latest=shuffle(datedLatest.length>=10?datedLatest:latest).sort((a,b)=>(score(b)-score(a))+3*(Number(seenArtists.has(a.user?.name))-Number(seenArtists.has(b.user?.name)))).map(t=>({...t,_reason:`Свежий релиз${releaseLabel(t.release_date)?' · '+releaseLabel(t.release_date):''}`}));lucky=shuffle(lucky).sort((a,b)=>score(b)-score(a)).map(t=>({...t,_reason:'Новое открытие'}));
    matched=shuffle(matched).sort((a,b)=>score(b)-score(a));
    let freshCount=Math.round(12*state.discovery/100),genreCount=Math.min(matched.length,Math.max(3,8-freshCount)),familiarCount=15-freshCount-genreCount;
    let familiar=[...state.likes.filter(x=>x.stream).map(t=>({...t,_reason:'Из любимого'})),...trending,...lucky];
    let candidates=[...matched.slice(0,genreCount),...shuffle(familiar).slice(0,Math.max(0,familiarCount)),...latest.slice(0,freshCount)];
    let unique=new Map(candidates.filter(t=>!blocked.has(t.id)).map(t=>[t.id||`${t.artist}-${t.title}`,t]));
    queue=[...unique.values()].slice(0,15).map(t=>normalize(t,m));if(!queue.length)throw Error('Нет подходящих треков');
  }catch(error){queue=fallbackQueue();toast('Нет связи — включён локальный демо-режим')}
  index=0;
}
const current=()=>queue[index], fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
async function start(){let button=$('#start');button.disabled=true;button.querySelector('strong').textContent='Настраиваем волну…';$('#player').classList.add('visible');$('#title').textContent='Собираем твою волну…';$('#artist').textContent='Получаем треки из каталога';await buildQueue();button.disabled=false;button.querySelector('strong').textContent='Перезапустить мою волну';load();play()}
async function retune(message){if(!queue.length)return;let resume=playing;pause();toast(message);await buildQueue();load();if(resume)play()}
function scheduleRetune(message){if(!queue.length)return;clearTimeout(retuneTimer);retuneTimer=setTimeout(()=>retune(message),450)}
function load(){let t=current();if(!t)return;stopSound();elapsed=0;$('#title').textContent=t.title;$('#artist').textContent=`${t.artist} · ${t.genre} · ${t.reason}`;$('.cover').style.background=t.artwork?`center/cover url("${t.artwork}")`:`linear-gradient(135deg,${t.color},#17131e)`;$('#duration').textContent=fmt(t.duration);$('#time').textContent='0:00';$('#progress').value=0;paintRange($('#progress'));updateMediaSession(t);state.history=[t,...state.history.filter(x=>x.title!==t.title)].slice(0,20);save();libraries();likeVisual()}
function updateMediaSession(t){
  document.title=`${t.title} — ${t.artist} | Волна`;
  if(!('mediaSession'in navigator))return;
  navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:`Волна · ${t.genre}`,artwork:t.artwork?[{src:t.artwork,sizes:'480x480'}]:[{src:'wave-icon.svg',sizes:'512x512',type:'image/svg+xml'}]});
}
function seekTo(seconds){if(!current())return;elapsed=Math.max(0,Math.min(seconds,current().duration-1));if(media&&media.readyState>0)media.currentTime=elapsed;$('#time').textContent=fmt(Math.floor(elapsed));$('#progress').value=elapsed/current().duration*100;paintRange($('#progress'))}
function play(){if(!current())return start();tabChannel?.postMessage('claim-audio');playing=true;document.body.classList.add('wave-playing');$('#play .control-icon').textContent='Ⅱ';$('#play').setAttribute('aria-label','Пауза');if('mediaSession'in navigator)navigator.mediaSession.playbackState='playing';sound(current());clearInterval(timer);timer=setInterval(()=>{elapsed=media?Math.floor(media.currentTime):elapsed+1;if(elapsed>=current().duration)return next();$('#time').textContent=fmt(elapsed);$('#progress').value=elapsed/current().duration*100;paintRange($('#progress'))},500)}
function pause(){playing=false;document.body.classList.remove('wave-playing');$('#play .control-icon').textContent='▶';$('#play').setAttribute('aria-label','Воспроизвести');if('mediaSession'in navigator)navigator.mediaSession.playbackState='paused';clearInterval(timer);if(media)media.pause();else stopSound()}
function next(){pause();index=(index+1)%queue.length;load();play()}
function prev(){pause();index=(index-1+queue.length)%queue.length;load();play()}
function sound(t){
  if(t.stream&&media?.dataset.trackId===String(t.id)){media.play().catch(()=>showPlayRequired());return}
  if(t.stream){
    stopSound();media=new Audio();media.dataset.trackId=String(t.id);media.preload='auto';media.volume=+$('#volume').value/100;media.onended=next;
    let originalMeta=$('#artist').textContent,loadTimer=setTimeout(()=>{$('#artist').textContent='Загружаем аудио… обычно 2–5 секунд'},700);
    media.onloadedmetadata=()=>{if(elapsed>0&&elapsed<media.duration)media.currentTime=elapsed};
    media.oncanplay=()=>{clearTimeout(loadTimer);$('#artist').textContent=originalMeta};media.onplaying=()=>{$('#play .control-icon').textContent='Ⅱ'};
    media.onerror=()=>{clearTimeout(loadTimer);playing=false;document.body.classList.remove('wave-playing');$('#play .control-icon').textContent='▶';$('#artist').textContent='Не удалось загрузить этот трек';clearInterval(timer);toast('Ошибка потока — попробуй следующий трек')};
    media.src=t.stream;media.play().catch(()=>{clearTimeout(loadTimer);showPlayRequired()});return
  }
  let AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();let master=audio.createGain();master.gain.value=(+$('#volume').value/100)*.08;master.connect(audio.destination);let root=['Энергия','Вечеринка'].includes(t.mood)?146.83:110,notes=[1,1.25,1.5,2],step=0;let pulse=()=>{if(!audio)return;let o=audio.createOscillator(),g=audio.createGain();o.type=t.genre==='Электроника'?'triangle':'sine';o.frequency.value=root*notes[step++%4];g.gain.setValueAtTime(.001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.35,audio.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.48);o.connect(g).connect(master);o.start();o.stop(audio.currentTime+.5)};pulse();audio.pulse=setInterval(pulse,60000/t.tempo)}
function showPlayRequired(){playing=false;document.body.classList.remove('wave-playing');$('#play .control-icon').textContent='▶';clearInterval(timer);$('#artist').textContent='Нажми ▶ для запуска звука';toast('Браузер ждёт нажатия кнопки ▶')}
function stopSound(){if(media){media.onended=null;media.onerror=null;media.oncanplay=null;media.onplaying=null;media.pause();media.removeAttribute('src');media.load();media=null}if(audio){clearInterval(audio.pulse);audio.close();audio=null}}
function likeVisual(){let yes=current()&&state.likes.some(x=>x.title===current().title);$('#like .control-icon').textContent=yes?'♥':'♡';$('#like').classList.toggle('liked',yes);$('#like').setAttribute('aria-label',yes?'Убрать из любимых':'Добавить в любимые')}
function toggleLike(){let t=current();if(!t)return;let yes=state.likes.some(x=>x.title===t.title);state.likes=yes?state.likes.filter(x=>x.title!==t.title):[t,...state.likes];learn(t,yes?-2:2);save();libraries();likeVisual();toast(yes?'Убрано из любимых':'Вкус обновлён — будет больше похожего')}
function list(a,msg){return a.length?a.map(t=>`<div class="track"><i style="--color:${t.color}">♪</i><span><strong>${t.title}</strong><small>${t.artist} · ${t.genre}</small></span><time>${fmt(t.duration)}</time></div>`).join(''):`<div class="empty">${msg}</div>`}
function libraries(){$('#likesList').innerHTML=list(state.likes,'Пока пусто — нажми ♡ у понравившегося трека');$('#historyList').innerHTML=list(state.history,'История появится после запуска волны')}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),1800)}
$('#start').onclick=start;$('#waveOrb').onclick=()=>playing?pause():start();$('#play').onclick=()=>playing?pause():play();$('#next').onclick=next;$('#prev').onclick=prev;$('#like').onclick=toggleLike;$('#dislike').onclick=()=>{let t=current();if(t?.id&&!state.dislikes.includes(t.id))state.dislikes.push(t.id);learn(t,-3);save();toast('Вкус обновлён — похожих треков станет меньше');next()};$('#volume').oninput=()=>{if(media)media.volume=+$('#volume').value/100;else if(playing){stopSound();sound(current())}};$('#progress').oninput=e=>{if(current()){elapsed=Math.round(current().duration*e.target.value/100);if(media)media.currentTime=elapsed;$('#time').textContent=fmt(elapsed)}};$('#reset').onclick=()=>{if(confirm('Сбросить выбранные жанры, настроение, лайки и историю?')){localStorage.removeItem('waveState');location.reload()}};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button,.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.page).classList.add('active')});
$('.top-brand').onclick=event=>{event.preventDefault();document.querySelectorAll('nav button,.page').forEach(x=>x.classList.remove('active'));document.querySelector('nav button[data-page="home"]').classList.add('active');$('#home').classList.add('active');window.scrollTo({top:0,behavior:'smooth'})};
if('mediaSession'in navigator){
  navigator.mediaSession.setActionHandler('play',()=>play());navigator.mediaSession.setActionHandler('pause',()=>pause());
  navigator.mediaSession.setActionHandler('previoustrack',()=>prev());navigator.mediaSession.setActionHandler('nexttrack',()=>next());
  navigator.mediaSession.setActionHandler('seekbackward',details=>seekTo(elapsed-(details.seekOffset||10)));
  navigator.mediaSession.setActionHandler('seekforward',details=>seekTo(elapsed+(details.seekOffset||10)));
  navigator.mediaSession.setActionHandler('seekto',details=>seekTo(details.seekTime||0));
}
if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
if(tabChannel)tabChannel.onmessage=event=>{if(event.data==='claim-audio'&&playing){pause();toast('Музыка продолжилась в другой вкладке')}};
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload()});
window.onbeforeunload=stopSound;choices();libraries();
