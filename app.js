const WAVE_BUILD='startup-stage2-v1-20260929';
window.WAVE_BUILD=WAVE_BUILD;
document.documentElement.dataset.build=WAVE_BUILD;
console.info('WAVE BUILD:',WAVE_BUILD);
const MOODS=[['Спокойствие','☁',64,'#7056db'],['Энергия','ϟ',124,'#e8643e'],['Мечтательно','☾',70,'#8b57d8'],['Фокус','◎',82,'#318d91'],['Романтика','♡',76,'#bb74b5'],['Вечеринка','✦',132,'#d64c9b']];
const MOOD_CARDS=[['Спокойное','Расслабиться'],['Бодрое','Энергия на день'],['Мечтательное','Погрузиться в мысли'],['Концентрация','Сосредоточиться'],['Романтичное','Для особенных моментов'],['Вечеринка','Танцевать до утра']];
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
let state=(window.__WAVE_TEST_MODE__?null:JSON.parse(localStorage.getItem('waveState')||'null'))||{mood:'Спокойствие',genres:['Поп','Электроника'],discovery:50,likes:[],history:[]};
state.likes ||= []; state.history ||= []; state.dislikes ||= []; state.taste ||= {genres:{},artists:{}};state.trackStats||={};
state.crossfadeEnabled ??= true;state.crossfadeDuration=Number.isFinite(+state.crossfadeDuration)?Math.max(0,Math.min(10,+state.crossfadeDuration)):5;
state.repeatCurrent ??= false;
state.genreUsageCount||={};state.recentGenreSelections||=[];state.taste.subgenres||={};
state.genreIntentStrength=Number.isFinite(+state.genreIntentStrength)?+state.genreIntentStrength:(state.genres.length?.7:0);
if(!state.genreTasteMigrated){let migrated={};Object.entries(state.taste.genres||{}).forEach(([genre,value])=>{let family=WaveGenre.normalizeGenre(genre).normalizedGenre;migrated[family]=(migrated[family]||0)+value});state.taste.genres={...state.taste.genres,...migrated};state.genreTasteMigrated=true}
let waveSession=WaveRecommendation.createSession(state.waveSession||{currentMood:state.mood,noveltyLevel:state.discovery/100});
let queue=[],index=0,catalog=[],catalogLoadedAt=0,playing=false,elapsed=0,timer,audio,media,playbackRetryCount=0,playbackStoppedOnError=false,playedSinceCatalogRefresh=0,catalogRefreshInFlight=false;
let failedTrackIds=new Set();
const MAX_PLAYBACK_RETRIES=2;
const MAX_STREAM_VALIDATION_CANDIDATES=8;
const PLAYABLE_CACHE_TTL=12*60*1000;
let verifiedPlayableTrackIds=new Map(),selectionInProgress=false;
let waveAudioContext=null,waveAnalyzer=null,waveTrackBpm=90,waveFrame=0,waveFrameAt=0,waveAudioNodes=new WeakMap(),waveAnalyzableTrackIds=new Set();
window.__lastWaveSelections=[];
let genreQuery='';
let searchResults=[],searchTimer,searchRequest=0;
const sourceManager=new WaveSourceManager();
const PLAYER_STATES={IDLE:'IDLE',LOADING:'LOADING',PLAYING:'PLAYING',PAUSED:'PAUSED',ERROR:'ERROR'};
let playerState=null,playbackBuffer={current:null,next:null,backupNext:null},preloadMedia=null,preloadReady=false,preloadRequestId=0,bufferFillPromise=null,nextStartedAt=0,crossfadeInProgress=false,crossfadeFrame=0;
const tabChannel='BroadcastChannel'in window?new BroadcastChannel('wave-player'):null;
const $=s=>document.querySelector(s), save=()=>{state.waveSession=waveSession;if(!window.__WAVE_TEST_MODE__)localStorage.setItem('waveState',JSON.stringify(state))};
$('#home').insertBefore($('#searchSection'),$('#home').firstElementChild);
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
function paintRange(input){input.style.setProperty('--value',`${(input.value-input.min)/(input.max-input.min)*100}%`)}
document.querySelectorAll('input[type="range"]').forEach(input=>{paintRange(input);input.addEventListener('input',()=>paintRange(input))});
function choices(){
  let genreScroll=$('#genres')?.scrollTop||0;document.body.dataset.waveMood=state.mood;
  $('#moods').innerHTML=MOODS.map((m,i)=>`<button class="mood ${state.mood===m[0]?'selected':''}" data-mood="${m[0]}" aria-pressed="${state.mood===m[0]}"><b>${m[1]}</b><span>${MOOD_CARDS[i][0]}</span><small>${MOOD_CARDS[i][1]}</small><i aria-hidden="true">›</i></button>`).join('');
  let visible=GENRES.filter(g=>g.toLocaleLowerCase('ru').includes(genreQuery)).sort((a,b)=>Number(state.genres.includes(b))-Number(state.genres.includes(a))||(state.recentGenreSelections.indexOf(a)<0?999:state.recentGenreSelections.indexOf(a))-(state.recentGenreSelections.indexOf(b)<0?999:state.recentGenreSelections.indexOf(b))||(state.genreUsageCount[b]||0)-(state.genreUsageCount[a]||0));
  $('#genres').innerHTML=visible.length?visible.map(g=>`<button class="genre ${state.genres.includes(g)?'selected':''}" data-genre="${g}" aria-pressed="${state.genres.includes(g)}">${g}</button>`).join(''):'<span class="genre-empty">Такого жанра пока нет</span>';
  $('#genreCount').textContent=genreQuery?`найдено: ${visible.length}`:`выбирай несколько · ${GENRES.length} направлений`;
  $('#genres').scrollTop=genreScroll;$('#genres').setAttribute('aria-label','Жанры — прокручиваемый список. Выбрано '+state.genres.length);
  $('#hint').textContent=`${state.mood} · ${state.genres.join(', ')||'Любые жанры'}`;
}
$('#showMoods').onclick=()=>{const expanded=$('#moods').classList.toggle('expanded');$('#showMoods').setAttribute('aria-expanded',String(expanded));$('#showMoods').innerHTML=(expanded?'Свернуть':'Показать все')+' <span aria-hidden="true">›</span>'};
$('#moods').onclick=e=>{let b=e.target.closest('[data-mood]');if(b&&state.mood!==b.dataset.mood){state.mood=b.dataset.mood;WaveRecommendation.updateWavePreferences(waveSession,{mood:state.mood});save();choices();invalidateNextBuffer('mood');void loadCatalog(true);toast('Настроение обновлено — повлияет на следующий трек')}};
$('#genres').onclick=e=>{let b=e.target.closest('[data-genre]');if(!b)return;let g=b.dataset.genre,adding=!state.genres.includes(g);state.genres=adding?[...state.genres,g]:state.genres.filter(x=>x!==g);state.genreIntentStrength=state.genres.length?1:0;if(adding){state.genreUsageCount[g]=(state.genreUsageCount[g]||0)+1;state.recentGenreSelections=[g,...state.recentGenreSelections.filter(x=>x!==g)].slice(0,20)}save();choices();invalidateNextBuffer('genre');void loadCatalog(true);toast('Жанры обновлены — повлияют на следующий трек')};
$('#genreSearch').oninput=e=>{genreQuery=e.target.value.trim().toLocaleLowerCase('ru');choices()};
function renderMusicResults(message=''){
  let box=$('#musicResults');
  if(message){box.innerHTML=`<div class="search-message">${escapeHtml(message)}</div>`;box.classList.add('open');return}
  if(!searchResults.length){box.classList.remove('open');box.innerHTML='';return}
  box.innerHTML=searchResults.map((t,i)=>`<button class="music-result" data-search-index="${i}"><img src="${escapeHtml(t.artwork||'wave-icon.svg')}" alt=""><span><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.artist||'Исполнитель')}${t.album?` · Альбом: ${escapeHtml(t.album)}`:''}</small></span><i>▶</i></button>`).join('');box.classList.add('open')
}
async function searchMusic(value){
  let query=value.trim(),request=++searchRequest;if(query.length<2){searchResults=[];renderMusicResults();return}
  renderMusicResults('Ищем треки и альбомы…');
  try{let results=await sourceManager.searchTracks(query);if(request!==searchRequest)return;searchResults=results.slice(0,30);renderMusicResults(searchResults.length?'':'Ничего не найдено')}
  catch{if(request===searchRequest){searchResults=[];renderMusicResults('Поиск временно недоступен')}}
}
$('#musicSearch').oninput=e=>{clearTimeout(searchTimer);let value=e.target.value;if(value.trim().length<2){searchRequest++;searchResults=[];renderMusicResults();return}searchTimer=setTimeout(()=>searchMusic(value),320)};
$('#musicResults').onclick=async e=>{const button=e.target.closest('[data-search-index]');if(!button||selectionInProgress)return;const track=searchResults[+button.dataset.searchIndex];if(!track)return;const m=MOODS.find(x=>x[0]===state.mood)||MOODS[0];const chosen=normalize({...track,_reason:'Найдено через поиск'},m);if(await playExplicit(chosen)){renderMusicResults();$('#musicResults').classList.remove('open');closeSearch()}else toast('Этот аудиопоток недоступен')};

document.addEventListener('click',e=>{if(!e.target.closest('.music-search'))$('#musicResults').classList.remove('open')});
$('#discovery').value=state.discovery;paintRange($('#discovery'));
function renderDiscovery(){let output=$('#discoveryValue');if(output)output.textContent=`${state.discovery}%`;$('#discoverText').textContent=state.discovery<35?'В основном музыка, похожая на любимую':state.discovery>65?'Больше незнакомых исполнителей':'Поровну знакомого и новых открытий'}
$('#discovery').oninput=e=>{state.discovery=+e.target.value;WaveRecommendation.updateWavePreferences(waveSession,{noveltyLevel:state.discovery/100});renderDiscovery();save();invalidateNextBuffer('discovery',true)};renderDiscovery();
$('#discovery').onchange=()=>toast('Баланс обновлён — повлияет на следующий трек');
$('#crossfadeEnabled').checked=state.crossfadeEnabled;$('#crossfadeDuration').value=state.crossfadeDuration;
function renderCrossfadeSetting(){let enabled=$('#crossfadeEnabled').checked,duration=+$('#crossfadeDuration').value;$('#crossfadeValue').textContent=`${duration.toLocaleString('ru-RU')} сек`;$('.transition-setting').classList.toggle('disabled',!enabled)}
$('#crossfadeEnabled').onchange=e=>{state.crossfadeEnabled=e.target.checked;save();renderCrossfadeSetting()};
$('#crossfadeDuration').oninput=e=>{state.crossfadeDuration=+e.target.value;state.crossfadeEnabled=state.crossfadeDuration>0;$('#crossfadeEnabled').checked=state.crossfadeEnabled;save();renderCrossfadeSetting()};renderCrossfadeSetting();
function fallbackQueue(){let m=MOODS.find(x=>x[0]===state.mood)||MOODS[0];return Array.from({length:9},(_,i)=>({title:TITLES[(i+Math.floor(Math.random()*9))%9],artist:ARTISTS[Math.floor(Math.random()*7)],genre:state.genres[i%Math.max(1,state.genres.length)]||'Разное',mood:m[0],tempo:m[2]+(i%3-1)*5,color:m[3],duration:105+(i*13)%76,reason:'Локальный демо-режим',source:'Local Demo'}))}
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const genreMap=Object.fromEntries(GENRE_PAIRS);
const moodMap={'Спокойствие':['peaceful','chill','cool','relaxing'],'Энергия':['energizing','fiery','excited','upbeat'],'Фокус':['focused','sophisticated','serious'],'Мечтательно':['dreamy','romantic','sentimental','yearning'],'Романтика':['romantic','tender','sentimental','love'],'Вечеринка':['party','excited','upbeat','energizing']};
function normalize(t,m){let source=t.source==='Local Demo'?'Local Demo':String(t.source||'audius').toLowerCase().replace('internet archive','archive'),track=WaveTrackModel.normalizeTrack(t,source);return {...track,color:t.color||m[3],duration:track.duration||180,genre:track.genre||'Разное',mood:track.mood||'',reason:t._reason||track.reason}}
function releaseLabel(value){if(!value)return '';let date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
const openAudius=t=>t.is_available!==false&&t.access?.stream!==false&&!t.stream_conditions&&!t.is_stream_gated&&!t.is_unlisted&&!t.is_delete&&!!t.track_cid;
async function fetchArchiveTracks(query){
  let q=encodeURIComponent(`mediatype:audio AND format:"VBR MP3" AND licenseurl:[* TO *] AND (${query||'music'})`),url=`https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl&rows=8&output=json`;
  let search=await fetch(url,{signal:AbortSignal.timeout(9000)}).then(r=>r.json()),docs=search.response?.docs||[];
  let items=await Promise.all(docs.map(async doc=>{try{let meta=await fetch(`https://archive.org/metadata/${encodeURIComponent(doc.identifier)}`,{signal:AbortSignal.timeout(9000)}).then(r=>r.json());let file=(meta.files||[]).find(f=>['VBR MP3','MP3'].includes(f.format)&&f.name&&!f.name.includes('_64kb'));if(!file)return null;return{id:`ia:${doc.identifier}`,title:doc.title||file.title||doc.identifier,artist:Array.isArray(doc.creator)?doc.creator[0]:doc.creator||'Internet Archive',genre:query||'Открытая музыка',duration:Math.round(+file.length)||180,artwork:`https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`,stream:`https://archive.org/download/${encodeURIComponent(doc.identifier)}/${file.name.split('/').map(encodeURIComponent).join('/')}`,source:'Internet Archive',_reason:'Открытая лицензия · Internet Archive'}}catch{return null}}));
  return items.filter(Boolean)
}
let catalogTask=null,catalogRequest=0;
async function loadCatalog(force=false,merge=false,quiet=false,firstBatch=false){
  if(catalog.length&&!force&&Date.now()-catalogLoadedAt<15*60*1000)return catalog;
  const revision=playbackController.contextRevision;
  if(catalogTask?.revision===revision)return firstBatch?catalogTask.initial:catalogTask.complete;
  const request=++catalogRequest,m=MOODS.find(x=>x[0]===state.mood)||MOODS[0],genres=state.genres.slice(0,8).map(label=>genreMap[label]||label);
  let firstResolve,combined=merge?catalog.slice():[],published=false;
  const initial=new Promise(resolve=>firstResolve=resolve),valid=()=>revision===playbackController.contextRevision&&request===catalogRequest;
  const publish=(tracks,emergency=false)=>{if(!valid())return;combined=sourceManager.deduplicate([...combined,...tracks.map(t=>normalize(t,m))]);const selection=WaveGenre.selectPool(combined,genres,{emergency});if(selection.tracks.length){catalog=sourceManager.deduplicate(selection.tracks);catalogLoadedAt=Date.now();if(!published){published=true;firstResolve(catalog)}}};
  const complete=Promise.resolve().then(async()=>{
    try{
      const source=await sourceManager.getCatalog({genres,onBatch:tracks=>publish(tracks)});if(!valid()){logPlayback('STALE_RESULT_DISCARDED',{resultType:'catalog'});return catalog}publish(source);
      if(catalog.length<12||!published){const queries=[...new Set(genres.flatMap(g=>WaveGenre.queriesFor(g)))].slice(0,6);const settled=await Promise.allSettled(queries.map(q=>sourceManager.searchTracks(q)));for(const result of settled)if(result.status==='fulfilled')publish(result.value)}
      if(!published)publish([],true);
      if(!published&&valid()){catalog=fallbackQueue().map(t=>normalize(t,m));catalogLoadedAt=Date.now();if(!quiet)toast('Нет связи — включён локальный демо-режим')}
      return catalog;
    }catch(error){if(valid()&&!catalog.length){catalog=fallbackQueue().map(t=>normalize(t,m));if(!quiet)toast('Нет связи — включён локальный демо-режим')}return catalog}
    finally{firstResolve(catalog);if(catalogTask?.request===request)catalogTask=null}
  });
  catalogTask={revision,request,initial,complete};return firstBatch?initial:complete;
}
function maybeReplenishCatalog(event,listenedSeconds){
  if(event==='error'||catalogRefreshInFlight)return;
  if(event==='ended'||listenedSeconds>=10)playedSinceCatalogRefresh++;
  let available=WaveRecommendation.eligibleCandidates(catalog,waveSession).candidates.length;
  if(playedSinceCatalogRefresh<12&&available>=15)return;
  playedSinceCatalogRefresh=0;catalogRefreshInFlight=true;void loadCatalog(true,true,true).finally(()=>{catalogRefreshInFlight=false});
}
function recommendationContext(){return {state,session:waveSession,selectedGenres:state.genres.map(label=>genreMap[label]||label),genreIntentStrength:state.genreIntentStrength}}
function chooseNextTrack(pool=catalog){
  let selected=WaveRecommendation.getNextTrack(pool,recommendationContext());if(!selected)return null;
  let t={...selected.track,reason:`${selected.selectionType} · настроение ${selected.moodScore.toFixed(2)} · новизна ${selected.userNoveltyScore.toFixed(2)}`};
  let debug={track_id:t.id,track_name:t.title,artist:t.artist,preference_score:+selected.preferenceScore.toFixed(4),preference_weight:selected.preferenceWeight,similarity_score:+selected.similarityScore.toFixed(4),similarity_weight:selected.similarityWeight,mood_score:+selected.moodScore.toFixed(4),mood_weight:selected.moodWeight,user_novelty_score:+selected.userNoveltyScore.toFixed(4),user_novelty_weight:selected.userNoveltyWeight,release_novelty_score:+selected.releaseNoveltyScore.toFixed(4),release_novelty_weight:selected.releaseNoveltyWeight,diversity_score:+selected.diversityScore.toFixed(4),diversity_weight:selected.diversityWeight,final_score:+selected.finalScore.toFixed(4),repeat_penalty:+selected.repeatPenalty.toFixed(4),artist_repeat_penalty:+selected.artistRepeatPenalty.toFixed(4),current_mood:waveSession.currentMood,novelty_level:waveSession.noveltyLevel,selection_type:selected.selectionType};
  window.__lastSelectionDebug=debug;console.table(debug);return t;
}
async function resolveAudiusStream(trackId){
  let response=await fetch(`https://api.audius.co/v1/tracks/${encodeURIComponent(trackId)}/stream?no_redirect=true`,{cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error(`resolve HTTP ${response.status}`);
  let json=await response.json(),url=json?.data;
  if(typeof url!=='string'||!/^https:\/\//i.test(url))throw Error('Audius did not return a stream URL');
  return url;
}
function validationRequest(parentSignal){const controller=new AbortController(),abort=()=>controller.abort(parentSignal?.reason),timer=setTimeout(()=>controller.abort(new DOMException('Stream validation timeout','TimeoutError')),8000);if(parentSignal?.aborted)abort();else parentSignal?.addEventListener('abort',abort,{once:true});return {signal:controller.signal,dispose(){clearTimeout(timer);parentSignal?.removeEventListener('abort',abort)}}}
async function probeStreamWithAudio(url,signal){
  return new Promise((resolve,reject)=>{let probe=new Audio(),done=false,timer=setTimeout(()=>finish(false,new DOMException('Audio probe timeout','TimeoutError')),8000);const abort=()=>finish(false,new DOMException('Validation cancelled','AbortError')),finish=(ok,value)=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);probe.onloadedmetadata=probe.oncanplay=probe.onerror=null;probe.pause();probe.removeAttribute('src');probe.load();ok?resolve(value):reject(value)};if(signal?.aborted){abort();return}signal?.addEventListener('abort',abort,{once:true});probe.muted=true;probe.preload='metadata';probe.onloadedmetadata=probe.oncanplay=()=>finish(true,{status:0,contentType:'audio/browser-probe',validation:'audio-probe',waveAnalysisAllowed:false});probe.onerror=()=>finish(false,Error(`media ${probe.error?.code||0}: stream error`));probe.src=url;probe.load()})
}
async function validateStreamUrl(url,signal){
  const request=validationRequest(signal);
  try{
    const response=await fetch(url,{headers:{Range:'bytes=0-2047'},cache:'no-store',signal:request.signal}),contentType=(response.headers.get('content-type')||'').toLowerCase(),result={status:response.status,contentType,validation:'range-get',waveAnalysisAllowed:true};
    if(response.body)void response.body.cancel().catch(()=>{});
    if(![200,206].includes(response.status)||!contentType.startsWith('audio/'))throw Object.assign(Error('Stream response invalid'),{httpResult:result});return result;
  }catch(error){if(signal?.aborted||request.signal.aborted||error?.httpResult)throw error;return probeStreamWithAudio(url,signal)}finally{request.dispose()}
}
async function validateAudiusStream(track,rank,score){
  let id=WaveRecommendation.idOf(track),url;
  try{url=await resolveAudiusStream(id)}catch(error){console.warn('STREAM_RESOLVE_FAILED',{trackId:id,title:track.title,rank,error:error.message});failedTrackIds.add(id);return null}
  try{let result=await validateStreamUrl(url);console.log('STREAM_VALIDATE_OK',{trackId:id,status:result.status,contentType:result.contentType,source:track.source,validation:result.validation});verifiedPlayableTrackIds.set(id,Date.now()+PLAYABLE_CACHE_TTL);return {...track,stream:url}}
  catch(error){console.warn('STREAM_VALIDATE_FAILED',{trackId:id,title:track.title,rank,status:error?.httpResult?.status||0,error:error.message});failedTrackIds.add(id);return null}
}
async function validateCandidate(selected,rank,token=null,signal=null){
  startupMark('candidate_selected',selected.track);startupMark('stream_validation_start',selected.track);
  let track=selected.track,id=WaveRecommendation.idOf(track),cached=(verifiedPlayableTrackIds.get(id)||0)>Date.now();
  console.log('STREAM_VALIDATE_START',{trackId:id,title:track.title,rank,score:+selected.finalScore.toFixed(4)});
  if(track.source==='Local Demo')return track;
  try{let resolved=await sourceManager.resolveTrack(track,{signal});if(signal?.aborted)return null;if(token&&!tokenIsCurrent(token))return null;if(cached){startupMark('stream_validation_ok',track);return {...resolved,waveAnalysisAllowed:waveAnalyzableTrackIds.has(id)}};let result=await validateStreamUrl(resolved.stream,signal);if(signal?.aborted)return null;if(token&&!tokenIsCurrent(token))return null;if(result.waveAnalysisAllowed)waveAnalyzableTrackIds.add(id);resolved={...resolved,waveAnalysisAllowed:result.waveAnalysisAllowed};console.log('STREAM_VALIDATE_OK',{trackId:id,status:result.status,contentType:result.contentType,source:resolved.activeSource,validation:result.validation});verifiedPlayableTrackIds.set(id,Date.now()+PLAYABLE_CACHE_TTL);startupMark('stream_validation_ok',track);return resolved}
  catch(error){if(signal?.aborted||token&&!tokenIsCurrent(token))return null;console.warn('STREAM_VALIDATE_FAILED',{trackId:id,title:track.title,rank,status:error?.httpResult?.status||0,errorName:error.name});failedTrackIds.add(id);logPlayback('SOURCE_FAILURE',{failedTrackKey:playbackKey(track),errorName:error.name,errorCode:error?.httpResult?.status??null});return null}
}
function selectedTrack(selected,track){
  let t={...track,reason:`${selected.selectionType} · настроение ${selected.moodScore.toFixed(2)} · новизна ${selected.userNoveltyScore.toFixed(2)}`};
  let debug={track_id:t.id,track_name:t.title,artist:t.artist,preference_score:+selected.preferenceScore.toFixed(4),preference_weight:selected.preferenceWeight,similarity_score:+selected.similarityScore.toFixed(4),similarity_weight:selected.similarityWeight,mood_score:+selected.moodScore.toFixed(4),mood_weight:selected.moodWeight,user_novelty_score:+selected.userNoveltyScore.toFixed(4),user_novelty_weight:selected.userNoveltyWeight,release_novelty_score:+selected.releaseNoveltyScore.toFixed(4),release_novelty_weight:selected.releaseNoveltyWeight,diversity_score:+selected.diversityScore.toFixed(4),diversity_weight:selected.diversityWeight,final_score:+selected.finalScore.toFixed(4),repeat_penalty:+selected.repeatPenalty.toFixed(4),artist_repeat_penalty:+selected.artistRepeatPenalty.toFixed(4),current_mood:waveSession.currentMood,novelty_level:waveSession.noveltyLevel,selection_type:selected.selectionType};
  let chosenId=WaveRecommendation.idOf(t),selectionLog={chosenId,chosenTitle:t.title,recentTrackIds:waveSession.previousTracks.slice(-WAVE_RECOMMENDATION_CONFIG.hardTrackBlock).map(x=>String(x.id)),hardBlockedCount:selected.hardBlockedCount,eligibleCandidateCount:selected.eligibleCandidateCount,candidatePoolSize:selected.candidatePoolSize,rankBeforeSampling:selected.rankBeforeSampling,sampledPosition:selected.sampledPosition,finalScore:+selected.finalScore.toFixed(4),selectionType:selected.selectionType};
  window.__lastWaveSelectionDebug=selectionLog;window.__lastSelectionDebug=debug;console.table(debug);console.log('WAVE_SELECTION',selectionLog);return t;
}
async function choosePlayableTrack(reservedIds=new Set(),token=selectionToken(),allowRecent=false){
  const eligible=WaveRecommendation.eligibleCandidates(catalog.filter(matchesCurrentGenre),waveSession);
  let candidates=eligible.candidates.filter(t=>!reservedIds.has(WaveRecommendation.idOf(t))&&isCandidateApplicable(t,token,null,allowRecent)&&(sourceManager.sources.has(t.source)||!!t.stream||t.source==='Local Demo'));
  let context=recommendationContext(),ranked=WaveRecommendation.getRankedCandidates(candidates,context,WAVE_RECOMMENDATION_CONFIG.candidateTopK),weighted=WaveRecommendation.getWeightedCandidateOrder(candidates,context,WAVE_RECOMMENDATION_CONFIG.candidateTopK);
  window.__lastCandidateRanking=ranked.slice(0,10).map((x,i)=>({rank:i+1,trackId:WaveRecommendation.idOf(x.track),title:x.track.title,score:+x.finalScore.toFixed(4),source:x.track.source}));
  let validations=[];window.__lastStreamValidation=validations;
  let cursor=0,finished=false,active=0;const pending=new Map(),limit=Math.min(weighted.length,MAX_STREAM_VALIDATION_CANDIDATES);
  let resolveResult;const result=new Promise(resolve=>resolveResult=resolve);
  const finish=winner=>{if(finished)return;finished=true;for(const [id,controller] of pending){if(id!==winner?._reservationId){controller.abort();releaseReservation(id)}}resolveResult(winner)};
  const worker=async()=>{
    active++;
    try{while(!finished&&cursor<limit&&tokenIsCurrent(token)){
      const i=cursor++,selected=weighted[i],reservationId=reserveCandidate(selected.track,token,allowRecent);if(!reservationId)continue;
      if(token.operation){if(token.operation.remainingCandidates<=0){releaseReservation(reservationId);break}token.operation.remainingCandidates--}
      const controller=new AbortController();pending.set(reservationId,controller);let handedOff=false;
      try{
        const playable=await operationAwait(validateCandidate(selected,i+1,token,controller.signal),token.operation);
        validations.push({rank:i+1,trackId:WaveRecommendation.idOf(selected.track),source:selected.track.source,playable:!!playable});
        if(finished)break;
        if(!tokenIsCurrent(token)||!isCandidateApplicable(selected.track,token,reservationId,allowRecent)){logPlayback('STALE_RESULT_DISCARDED',{discardedTrackKey:playbackKey(selected.track)});continue}
        if(playable&&isCandidateApplicable(playable,token,reservationId,allowRecent)){const chosen=selectedTrack(selected,playable);chosen._reservationId=reservationId;handedOff=true;logPlayback('SELECTED',{selectedTrackKey:playbackKey(chosen),selectionRank:selected.rankBeforeSampling??null,sampledPosition:selected.sampledPosition??null});finish(chosen);break}
      }finally{pending.delete(reservationId);if(!handedOff)releaseReservation(reservationId)}
    }}finally{active--;if(!active&&!finished)finish(null)}
  };
  const concurrency=playbackController.validationConcurrency||2;
  for(let i=0;i<concurrency;i++)void worker().catch(()=>finish(null));
  let winner;try{winner=await operationAwait(result,token.operation)}finally{if(!finished)finish(null)}
  if(winner)return winner;
  logPlayback('POOL_EXHAUSTED');return null;
}

window.waveDebugSummary=()=>{let tracks=window.__lastWaveSelections.slice(-60),positions=new Map(),repeatingIds=new Set(),minimumRepeatDistance=null;tracks.forEach((id,index)=>{if(positions.has(id)){repeatingIds.add(id);let distance=index-positions.get(id);minimumRepeatDistance=minimumRepeatDistance===null?distance:Math.min(minimumRepeatDistance,distance)}positions.set(id,index)});let eligible=WaveRecommendation.eligibleCandidates(catalog.filter(t=>!failedTrackIds.has(WaveRecommendation.idOf(t))),waveSession);return {lastTracks:tracks,uniqueCount:new Set(tracks).size,repeatingIds:[...repeatingIds],minimumRepeatDistance,catalogSize:catalog.length,eligiblePoolSize:eligible.candidates.length,hardBlockWindow:eligible.windowSize}};
const current=()=>queue[index];
function fmt(value){const seconds=Number.isFinite(Number(value))&&Number(value)>0?Math.floor(Number(value)):0,hours=Math.floor(seconds/3600),minutes=Math.floor(seconds/60)%60,tail=String(seconds%60).padStart(2,'0');return hours?`${hours}:${String(minutes).padStart(2,'0')}:${tail}`:`${Math.floor(seconds/60)}:${tail}`}
window.waveFormatTime=fmt;
const startupTraces=[];
let startupTrace=null;
function beginStartup(){startupTrace={id:crypto.randomUUID(),at:performance.now(),marks:{},candidates:new Map(),completed:false};startupMark('wave_click')}
function startupMark(phase,track=null){const trace=startupTrace;if(!trace||trace.completed)return;const now=performance.now(),key=track?playbackKey(track):null,candidatePhase=['candidate_selected','stream_validation_start','stream_validation_ok'].includes(phase);if(candidatePhase&&key){let marks=trace.candidates.get(key)||{};marks[phase]??=now;trace.candidates.set(key,marks);return}trace.marks[phase]??=now;performance.mark(`wave:${phase}`);performance.clearMarks(`wave:${phase}`);if(phase==='playing'){trace.completed=true;const m=trace.marks,span=(a,b)=>m[a]!=null&&m[b]!=null?Math.round((m[b]-m[a])*10)/10:null;startupTraces.push({id:trace.id,marks:Object.fromEntries(Object.entries(m).map(([k,v])=>[k,Math.round((v-trace.at)*10)/10])),clickToCandidateMs:span('wave_click','candidate_selected'),candidateToValidatedMs:span('candidate_selected','stream_validation_ok'),validatedToPlayMs:span('stream_validation_ok','play_called'),playToPlayingMs:span('play_called','playing'),totalMs:span('wave_click','playing')});if(startupTraces.length>20)startupTraces.shift()}}
function startupChoose(track){if(startupTrace&&!startupTrace.completed)Object.assign(startupTrace.marks,startupTrace.candidates.get(playbackKey(track))||{})}
window.waveStartupTimings=()=>startupTraces.slice();
const playbackController={sessionId:waveSession.sessionId||(waveSession.sessionId=crypto.randomUUID()),contextRevision:0,transitionSequence:0,activeTransition:null,pendingNext:false,reservations:new Map(),reservationSequence:0,playbackSequence:0,mediaSequence:0,event:null,bindings:new Map(),events:[],confirmedStarts:[],operation:null};
function playbackKey(track){return WaveTrackModel.sourceKey(track)}
function samePlaybackRecording(a,b){return WaveTrackModel.samePlaybackRecording(a,b)}
function bufferedAhead(element){if(!element?.buffered)return null;let p=Number(element.currentTime)||0;for(let i=0;i<element.buffered.length;i++)if(element.buffered.start(i)<=p&&element.buffered.end(i)>=p)return Math.max(0,element.buffered.end(i)-p);return 0}
function logPlayback(action,details={}){
  let element=media,eligible=WaveRecommendation.eligibleCandidates(catalog,waveSession);
  const event={buildId:WAVE_BUILD,eventTime:new Date().toISOString(),sessionId:playbackController.sessionId,playbackEventId:playbackController.event?.id||null,transitionId:playbackController.activeTransition?.id||null,bufferGeneration:preloadRequestId,contextRevision:playbackController.contextRevision,action,transitionReason:playbackController.activeTransition?.reason||null,currentTrackKey:current()?playbackKey(current()):null,nextTrackKey:playbackBuffer.next?playbackKey(playbackBuffer.next):null,backupTrackKey:playbackBuffer.backupNext?playbackKey(playbackBuffer.backupNext):null,selectedMood:state.mood,selectedGenres:[...state.genres],noveltyLevel:state.discovery/100,repeatMode:state.repeatCurrent,catalogSize:catalog.length,matchedGenreCount:catalog.filter(matchesCurrentGenre).length,eligibleCount:eligible.candidates.length,recentBlockedCount:eligible.hardBlockedCount,reservedCount:playbackController.reservations.size,failedSourceCount:failedTrackIds.size,selectionRank:null,sampledPosition:null,canonicalRecordingKey:current()?.canonicalRecordingKey||null,mediaElementId:element?.dataset.mediaElementId||null,currentTime:Number.isFinite(element?.currentTime)?element.currentTime:null,duration:Number.isFinite(element?.duration)?element.duration:null,readyState:element?.readyState??null,networkState:element?.networkState??null,bufferedAheadSeconds:bufferedAhead(element),errorName:null,errorCode:null,...details};
  playbackController.events.push(event);if(playbackController.events.length>300)playbackController.events.shift();
}
function matchesCurrentGenre(track){return !state.genres.length||state.genres.some(label=>WaveGenre.match(track,genreMap[label]||label).level!=='NONE')}
function newPlaybackOperation(reason){return {id:++playbackController.transitionSequence,reason,deadline:performance.now()+30000,remainingCandidates:MAX_STREAM_VALIDATION_CANDIDATES,retries:0,replenished:false}}
function selectionToken(operation=null){return {sessionId:playbackController.sessionId,generation:preloadRequestId,contextRevision:playbackController.contextRevision,operation}}
function tokenIsCurrent(token){return token.sessionId===playbackController.sessionId&&token.generation===preloadRequestId&&token.contextRevision===playbackController.contextRevision&&(!token.operation||performance.now()<token.operation.deadline)}
function operationAwait(task,operation){
  if(!operation)return task;let remaining=operation.deadline-performance.now();
  if(remaining<=0)return Promise.reject(new DOMException('Playback operation deadline','TimeoutError'));
  let timeout;return Promise.race([task,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new DOMException('Playback operation deadline','TimeoutError')),remaining)})]).finally(()=>clearTimeout(timeout));
}
function isCandidateApplicable(track,token,ownReservation=null,allowRecent=false,ignoreTrack=null){
  if(!track||!tokenIsCurrent(token)||(!allowRecent&&!matchesCurrentGenre(track))||failedTrackIds.has(WaveRecommendation.idOf(track)))return false;
  if((state.dislikes||[]).some(id=>WaveTrackModel.sourceKeys(track).includes(String(id))))return false;
  if([current(),playbackBuffer.next,playbackBuffer.backupNext].filter(other=>other&&other!==ignoreTrack).some(other=>samePlaybackRecording(track,other)))return false;
  if([...playbackController.bindings.values()].some(binding=>binding.event.active&&!binding.event.finalized&&samePlaybackRecording(track,binding.event.track)))return false;
  if([...playbackController.reservations.entries()].some(([id,reserve])=>id!==ownReservation&&samePlaybackRecording(track,reserve.track)))return false;
  if(!allowRecent){let eligible=WaveRecommendation.eligibleCandidates(catalog.filter(matchesCurrentGenre),waveSession);if(WaveRecommendation.isRecentlyPlayed(track,waveSession,eligible.windowSize))return false}
  return true;
}
function reserveCandidate(track,token,allowRecent=false){
  if(!isCandidateApplicable(track,token,null,allowRecent))return null;
  let id=++playbackController.reservationSequence;playbackController.reservations.set(id,{track,token});logPlayback('RESERVED',{reservedTrackKey:playbackKey(track)});return id;
}
function releaseReservation(id){if(id)playbackController.reservations.delete(id)}
function advanceBufferGeneration(reason,clearSlots=true){
  preloadRequestId++;bufferFillPromise=null;
  for(let [id,reserve] of playbackController.reservations)if(!tokenIsCurrent(reserve.token))releaseReservation(id);
  if(clearSlots){playbackBuffer.next=null;playbackBuffer.backupNext=null;cancelPreloadAudio()}else if(preloadMedia)preloadMedia.dataset.generation=String(preloadRequestId);
  logPlayback('BUFFER_INVALIDATED',{reason});
}
function beginPlaybackEvent(track){
  const event={id:playbackController.sessionId+':play:'+crypto.randomUUID(),track,confirmed:false,active:false,finalized:false,listenedSeconds:0,lastWallAt:null,lastPosition:null};
  playbackController.event=event;return event;
}
function sampleListening(binding){
  if(!binding)return;let event=binding.event,element=binding.element,now=performance.now(),position=Number(element?.currentTime);
  if(event.active&&event.lastWallAt!==null){let wall=Math.max(0,(now-event.lastWallAt)/1000),delta=element?position-event.lastPosition:wall;if(Number.isFinite(delta)&&delta>=0&&delta<=wall+.25)event.listenedSeconds+=Math.min(delta,wall)}
  event.lastWallAt=now;event.lastPosition=Number.isFinite(position)?position:0;
}
function markPlaying(binding){
  sampleListening(binding);let event=binding.event;event.active=true;
  if(!event.confirmed){event.confirmed=true;const key=playbackKey(event.track);playbackController.confirmedStarts.push({trackKey:key,playbackEventId:event.id});playbackController.confirmedStarts=playbackController.confirmedStarts.slice(-120);window.__lastWaveSelections=playbackController.confirmedStarts.map(x=>x.trackKey);logPlayback('PLAYING_CONFIRMED',{playbackEventId:event.id,currentTrackKey:key})}
}
function finalizePlayback(event,reason,binding=null){
  if(!event||event.finalized)return false;sampleListening(binding);event.finalized=true;event.active=false;
  let seconds=event.listenedSeconds,duration=Number(event.track.duration)||1,ratio=Math.max(0,Math.min(1,seconds/duration));
  WaveRecommendation.recordEvent(state,waveSession,event.track,reason,{playbackEventId:event.id,playingConfirmed:event.confirmed,listenedSeconds:seconds,progressRatio:ratio});
  if(event.confirmed)maybeReplenishCatalog(reason,seconds);save();libraries();logPlayback('EVENT_FINALIZED',{playbackEventId:event.id,finalizedTrackKey:playbackKey(event.track),finalizationReason:reason,listenedSeconds:seconds,progressRatio:ratio,playingConfirmed:event.confirmed});
  return true;
}
function currentBinding(){return playbackController.bindings.get(media||audio)||null}
function releaseMedia(element){
  if(!element)return;let binding=playbackController.bindings.get(element);if(binding)binding.released=true;
  for(let name of ['onended','onerror','onpause','onplay','onplaying','oncanplay','onwaiting','onstalled','onloadedmetadata','ontimeupdate','onseeking','onseeked'])element[name]=null;
  element.pause();element.removeAttribute('src');element.load();playbackController.bindings.delete(element);
}
window.waveDiagnostics=()=>({startupTimings:window.waveStartupTimings(),buildId:WAVE_BUILD,sessionId:playbackController.sessionId,controller:{bufferGeneration:preloadRequestId,contextRevision:playbackController.contextRevision,activeTransition:playbackController.activeTransition?.id||null,fillActive:!!bufferFillPromise,reservedCount:playbackController.reservations.size},summary:window.waveDebugSummary(),confirmedStarts:[...playbackController.confirmedStarts],events:[...playbackController.events]});
async function copyWaveDiagnostics(){
  const text=JSON.stringify(window.waveDiagnostics(),null,2);try{if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');await navigator.clipboard.writeText(text);toast('Диагностика скопирована')}catch{const field=$('#diagnosticText');field.hidden=false;field.value=text;field.focus();field.select();toast('Выдели и скопируй текст диагностики')}
}

function setPlayerState(nextState){if(playerState===nextState)return;playerState=nextState;let button=$('#play'),icon=button.querySelector('.control-icon'),orb=$('#waveOrb'),orbIcon=orb.querySelector('.orb-core i'),orbHint=orb.querySelector('.orb-core small'),playingNow=nextState===PLAYER_STATES.PLAYING,loading=nextState===PLAYER_STATES.LOADING,error=nextState===PLAYER_STATES.ERROR;button.dataset.state=nextState;icon.textContent=playingNow?'Ⅱ':error?'!':'▶';button.setAttribute('aria-label',playingNow?'Пауза':error?'Повторить воспроизведение':loading?'Загрузка':'Воспроизвести');document.querySelectorAll('[data-player-action="play"]').forEach(control=>{control.dataset.state=nextState;control.setAttribute('aria-label',playingNow?'Пауза':loading?'Загрузка':'Воспроизвести')});document.querySelectorAll('[data-play-icon] use').forEach(use=>use.setAttribute('href',playingNow?'#i-pause':'#i-play'));orb.dataset.state=nextState;orbIcon.textContent=playingNow?'Ⅱ':error?'↻':loading?'':'▶';orbHint.textContent=playingNow?'сейчас играет':nextState===PLAYER_STATES.PAUSED?'на паузе':loading?'подбираем музыку':error?'нажми, чтобы повторить':'нажми, чтобы включить';orb.setAttribute('aria-label',playingNow?'Поставить мою волну на паузу':error?'Повторить запуск моей волны':loading?'Моя волна загружается':'Запустить мою волну');orb.classList.remove('icon-swap');void orb.offsetWidth;orb.classList.add('icon-swap');document.body.classList.toggle('wave-playing',playingNow);if(playingNow)startWaveVisualizer();else stopWaveVisualizer();console.log('PLAYER_STATE',nextState);console.log('PLAYER_BUTTON_STATE',{state:nextState,icon:orbIcon.textContent,hint:orbHint.textContent})}
function cancelPreloadAudio(){if(!preloadMedia)return;preloadMedia.oncanplay=null;preloadMedia.onloadedmetadata=null;preloadMedia.onerror=null;preloadMedia.pause();preloadMedia.removeAttribute('src');preloadMedia.load();preloadMedia=null;preloadReady=false}
let preferenceFillTimer=null;
function invalidateNextBuffer(reason='manual',debounce=false){
  playbackController.contextRevision++;advanceBufferGeneration(reason,true);
  clearTimeout(preferenceFillTimer);if(current()&&reason!=='start'){if(debounce)preferenceFillTimer=setTimeout(()=>void fillPlaybackBuffer(),180);else void fillPlaybackBuffer()}
}
function preloadTrack(track,requestId){
  cancelPreloadAudio();if(!track?.stream)return;
  let element=new Audio();preloadMedia=element;preloadReady=false;
  element.dataset.trackId=String(track.id);element.dataset.generation=String(requestId);element.dataset.mediaElementId='media:'+ ++playbackController.mediaSequence;element.preload='auto';element.volume=+$('#volume').value/100;
  if(track.waveAnalysisAllowed)element.crossOrigin='anonymous';
  console.log('PRELOAD_START',{trackId:track.id,source:track.activeSource||track.source});
  let ready=()=>{if(Number(element.dataset.generation)!==preloadRequestId||preloadMedia!==element||!samePlaybackRecording(playbackBuffer.next,track)||element.readyState<3)return;const ahead=bufferedAhead(element);if(ahead!==null&&ahead<.15&&element.readyState<4)return;preloadReady=true;logPlayback('PRELOAD_READY',{preparedTrackKey:playbackKey(track),mediaElementId:element.dataset.mediaElementId,readyState:element.readyState,bufferedAheadSeconds:bufferedAhead(element)})};
  element.onloadeddata=element.oncanplay=element.oncanplaythrough=ready;
  element.onerror=()=>{if(requestId!==preloadRequestId||preloadMedia!==element)return;preloadReady=false;logPlayback('SOURCE_FAILURE',{failedTrackKey:playbackKey(track),errorCode:element.error?.code??null})};
  element.src=track.stream;element.load();
}
function fillPlaybackBuffer(){
  if(bufferFillPromise)return bufferFillPromise;
  if(playbackBuffer.next&&playbackBuffer.backupNext){if(!preloadMedia)preloadTrack(playbackBuffer.next,preloadRequestId);return Promise.resolve()}
  const token=selectionToken(),operation=newPlaybackOperation('buffer');token.operation=operation;
  let task=Promise.resolve().then(async()=>{
    logPlayback('BUFFER_REFILL');
    if(tokenIsCurrent(token)&&playbackBuffer.next&&!preloadMedia)preloadTrack(playbackBuffer.next,preloadRequestId);
    for(const slot of ['next','backupNext']){
      if(!tokenIsCurrent(token))return;
      if(playbackBuffer[slot])continue;
      let track=await choosePlayableTrack(new Set(),token);
      if(!track)continue;
      try{
        if(!tokenIsCurrent(token)||!isCandidateApplicable(track,token,track._reservationId)){logPlayback('STALE_RESULT_DISCARDED',{discardedTrackKey:playbackKey(track)});continue}
        playbackBuffer[slot]=track;
        if(slot==='next')preloadTrack(track,preloadRequestId);
      }finally{releaseReservation(track._reservationId);delete track._reservationId}
    }
  }).catch(error=>{logPlayback('SOURCE_FAILURE',{errorName:error.name});console.warn('BUFFER_REFILL_FAILED',{name:error.name})}).finally(()=>{
    if(bufferFillPromise===task)bufferFillPromise=null;
    for(let [id,reserve] of playbackController.reservations)if(reserve.token===token)releaseReservation(id);
  });
  bufferFillPromise=task;return task;
}

window.wavePlayerDebug=()=>({current:current(),next:playbackBuffer.next,backup:playbackBuffer.backupNext,currentSource:current()?.activeSource||current()?.source,playerState,audioReadyState:media?.readyState??null,audioNetworkState:media?.networkState??null,preloadReadyState:preloadMedia?.readyState??null,preloadReady,sources:sourceManager.debug()});
window.waveGenreDebug=track=>{let t=track||current(),selected=state.genres.map(label=>genreMap[label]||label),best=t&&selected.length?selected.map(label=>({label,...WaveGenre.match(t,label)})).sort((a,b)=>b.score-a.score)[0]:null;return t?{title:t.title,artist:t.artist,source:t.source,selectedGenre:selected,rawGenre:t.rawGenre,normalizedGenre:t.normalizedGenre,subgenres:t.subgenres,genreConfidence:t.genreConfidence,language:t.language,languageConfidence:t.languageConfidence,match:best}:null};
window.waveMoodDebug=track=>{let t=track||current();if(!t)return null;let result=WaveMood.score(t,state.mood,state);return {...window.waveGenreDebug(t),mood:state.mood,moodDirection:result.direction,moodScore:result.score,moodConfidence:result.confidence,moodReasons:result.reasons,bpm:t.bpm,energy:t.energy,valence:t.valence,danceability:t.danceability}};
window.waveMoodSessionDebug=()=>({selectedMood:state.mood,selectedGenre:state.genres.map(label=>genreMap[label]||label),genreIntentStrength:state.genreIntentStrength,currentMoodDirection:current()?WaveMood.directionOf(current(),state.mood):null,genreAffinities:state.moodIntent?.[state.mood]?.genres||{},subgenreAffinities:state.moodIntent?.[state.mood]?.subgenres||{},directionAffinities:state.moodIntent?.[state.mood]?.directions||{},skipStreak:state.moodSkipStreak||null,explorationLevel:state.moodSkipStreak?.explorationLevel||0,recentlySuppressedDirections:state.moodSkipStreak?.suppressedDirections||[],last10:(state.moodIntent?.[state.mood]?.signals||[]).slice(0,10),directionProfile:WaveMood.directions[state.mood]});
function crossfadeSeconds(event){if(!state.crossfadeEnabled||state.crossfadeDuration<=0)return 0;if(event==='dislike'||event==='skip')return .5;if(event==='next'||event==='error')return Math.min(state.crossfadeDuration,2);return state.crossfadeDuration}
function animateCrossfade(oldMedia,newMedia,seconds,targetVolume){
  return new Promise((resolve,reject)=>{const started=performance.now(),duration=Math.max(0,seconds*1000);clearTimeout(crossfadeFrame);
    const step=()=>{try{let ratio=duration?Math.min(1,(performance.now()-started)/duration):1,eased=ratio*ratio*(3-2*ratio);
      for(const element of [oldMedia,newMedia])sampleListening(playbackController.bindings.get(element));
      if(oldMedia)oldMedia.volume=Math.max(0,targetVolume*(1-eased));if(newMedia)newMedia.volume=Math.min(1,targetVolume*eased);
      if(ratio<1){crossfadeFrame=setTimeout(step,16);return}resolve();
    }catch(error){reject(error)}};step();
  });
}
function commitNextTrack(chosen){releaseReservation(chosen._reservationId);delete chosen._reservationId;queue=queue.slice(Math.max(0,index-49),index+1);queue.push(chosen);index=queue.length-1;load()}
async function crossfadeTo(chosen,reason){
  const outgoing=media,binding=currentBinding(),incoming=preloadMedia,seconds=crossfadeSeconds(reason),volume=+$('#volume').value/100;
  if(!playing||!outgoing||!incoming||!preloadReady||incoming.dataset.trackId!==String(chosen.id)||seconds<=0)return false;
  crossfadeInProgress=true;incoming.dataset.crossfadeStart='true';
  try{
    commitNextTrack(chosen);playing=true;const started=await sound(chosen);
    if(started){logPlayback('CROSSFADE_START',{outgoingMediaElementId:outgoing.dataset.mediaElementId,incomingMediaElementId:incoming.dataset.mediaElementId,crossfadeSeconds:seconds});await animateCrossfade(outgoing,incoming,seconds,volume);logPlayback('CROSSFADE_END')}
    return true;
  }catch(error){
    logPlayback('CROSSFADE_FALLBACK',{errorName:error.name});if(media===incoming&&!incoming.paused)setPlayerState(PLAYER_STATES.PLAYING);return true;
  }finally{
    finalizePlayback(binding?.event,reason,binding);releaseMedia(outgoing);
    delete incoming.dataset.crossfadeStart;incoming.volume=volume;crossfadeInProgress=false;
  }
}
window.waveCrossfadeDebug=()=>({current:current(),next:playbackBuffer.next,crossfadeEnabled:state.crossfadeEnabled,duration:state.crossfadeDuration,currentVolume:media?.volume??null,nextVolume:preloadMedia?.volume??null,playerState,crossfadeInProgress});
function unlockPlayback(){
  if(media)return;media=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');media.dataset.unlock='true';media.volume=0;media.play().catch(()=>{});
}
async function runTransition(reason,work,operation=null){
  if(selectionInProgress){if(reason==='next')playbackController.pendingNext=true;return false}
  const owner=operation||newPlaybackOperation(reason);selectionInProgress=true;playbackController.activeTransition=owner;playbackController.operation=owner;
  try{return await work(owner)}catch(error){logPlayback('SOURCE_FAILURE',{errorName:error.name});setPlayerState(PLAYER_STATES.ERROR);toast('Не удалось получить аудио. Нажми ▶, чтобы повторить.');return false}
  finally{
    selectionInProgress=false;crossfadeInProgress=false;playbackController.activeTransition=null;$('#waveOrb').disabled=false;
    if(playbackController.recoveryPending){const pending=playbackController.recoveryPending;playbackController.recoveryPending=null;queueMicrotask(()=>recoverPlayback(pending))}
    else if(playbackController.pendingNext){playbackController.pendingNext=false;queueMicrotask(()=>next('next'))}
    else if(current()&&!playbackStoppedOnError&&playerState!==PLAYER_STATES.ERROR&&!playbackController.event?.finalized)void fillPlaybackBuffer();
  }
}
function showPoolExhausted(){playing=false;clearInterval(timer);sampleListening(currentBinding());media?.pause();setPlayerState(PLAYER_STATES.ERROR);playbackStoppedOnError=true;$('#artist').textContent='Доступные треки закончились. Повтори подбор или измени жанры.';toast('Нет доступного следующего трека — повтори подбор или измени жанры');logPlayback('POOL_EXHAUSTED')}
async function pickForTransition(operation){
  let token=selectionToken(operation),chosen=playbackBuffer.next;
  if(chosen&&!isCandidateApplicable(chosen,token,null,false,chosen)){playbackBuffer.next=null;cancelPreloadAudio();chosen=null}
  if(chosen){playbackBuffer.next=playbackBuffer.backupNext;playbackBuffer.backupNext=null;return chosen}
  chosen=await choosePlayableTrack(new Set(),token);
  if(!chosen&&tokenIsCurrent(token)&&!operation.replenished&&operation.remainingCandidates>0){
    operation.replenished=true;await operationAwait(loadCatalog(true,true,true),operation);
    if(tokenIsCurrent(token))chosen=await choosePlayableTrack(new Set(),token);
  }
  return chosen;
}
async function start(){
  return runTransition('start',async operation=>{
    beginStartup();startupMark('recommendation_start');unlockPlayback();ensureWaveAudioContext();advanceBufferGeneration('start',true);failedTrackIds.clear();playbackStoppedOnError=false;setPlayerState(PLAYER_STATES.LOADING);$('#waveOrb').disabled=true;$('#player').classList.add('visible');$('#miniPlayer').classList.add('visible');
    await operationAwait(loadCatalog(false,false,false,true),operation);let chosen=await pickForTransition(operation);if(!chosen){showPoolExhausted();return false}
    startupChoose(chosen);const outgoing=currentBinding();finalizePlayback(outgoing?.event,'next',outgoing);if(outgoing)releaseMedia(outgoing.element);
    queue=[chosen];index=0;releaseReservation(chosen._reservationId);delete chosen._reservationId;load();await play();return true;
  });
}
async function next(reason='next',alreadyRecorded=false,operation=null){
  if(!current())return start();return runTransition(reason,async owner=>{
    nextStartedAt=performance.now();advanceBufferGeneration(reason,false);
    const token=selectionToken(owner),outgoing=currentBinding(),event=playbackController.event;
    let chosen=await pickForTransition(owner);
    if(!chosen||!tokenIsCurrent(token)){if(chosen)releaseReservation(chosen._reservationId);if(token.contextRevision!==playbackController.contextRevision)playbackController.pendingNext=true;else if(tokenIsCurrent(token)){if(!alreadyRecorded)finalizePlayback(event,reason,outgoing);showPoolExhausted()}return false}
    playbackStoppedOnError=false;
    if(await crossfadeTo(chosen,reason)){armPlaybackTimer();return true}
    if(!alreadyRecorded)finalizePlayback(event,reason,outgoing);stopSound();commitNextTrack(chosen);await play();return true;
  },operation);
}
async function playExplicit(track,reason='search',targetIndex=null){
  return runTransition(reason,async operation=>{
    advanceBufferGeneration(reason,true);ensureWaveAudioContext();let token=selectionToken(operation),reservation=reserveCandidate(track,token,true);if(!reservation)return false;
    try{
      operation.remainingCandidates--;let resolved=await operationAwait(validateCandidate(WaveRecommendation.scoreTrack(track,recommendationContext()),1,token),operation);
      if(!resolved||!isCandidateApplicable(resolved,token,reservation,true)){logPlayback('STALE_RESULT_DISCARDED');return false}
      const outgoing=currentBinding();finalizePlayback(playbackController.event,reason==='previous'?'next':reason,outgoing);stopSound();
      if(reason==='previous'&&targetIndex!==null){index=targetIndex;queue[index]=resolved;load()}else commitNextTrack(resolved);
      await play();return true;
    }finally{releaseReservation(reservation)}
  });
}
function prev(){if(selectionInProgress||index<1)return;const previousIndex=index-1;return playExplicit(queue[previousIndex],'previous',previousIndex)}

function renderPlayerUI(){let t=current();if(!t)return;let details=`${t.artist} · ${t.genre} · ${t.reason}`,background=t.artwork?`center/cover url("${t.artwork}")`:`linear-gradient(135deg,${t.color||'#8052ff'},#17131e)`;document.querySelectorAll('[data-player-title]').forEach(x=>x.textContent=t.title);document.querySelectorAll('[data-player-artist]').forEach(x=>x.textContent=details);document.querySelectorAll('[data-player-source]').forEach(x=>x.textContent=t.activeSource||t.source||'');document.querySelectorAll('[data-player-artwork]').forEach(x=>x.style.background=background);$('#duration').textContent=fmt(t.duration);$('#mobileDuration').textContent=fmt(t.duration);$('#player').classList.add('visible');$('#miniPlayer').classList.add('visible');likeVisual();renderRepeat();renderQueue()}
function updateProgressUI(seconds=elapsed){let t=current();if(!t)return;let ratio=Math.max(0,Math.min(100,seconds/t.duration*100));$('#time').textContent=fmt(Math.floor(seconds));$('#mobileTime').textContent=fmt(Math.floor(seconds));for(let input of [$('#progress'),$('#mobileProgress')]){input.value=ratio;paintRange(input)}document.querySelectorAll('[data-player-progress]').forEach(x=>x.style.setProperty('--progress',`${ratio}%`))}
function load(){let t=current();if(!t)return;elapsed=0;waveSession.currentTrackId=WaveRecommendation.idOf(t);if(!waveSession.seedTrackId)waveSession.seedTrackId=waveSession.currentTrackId;playbackBuffer.current=t;beginPlaybackEvent(t);renderPlayerUI();updateProgressUI(0);updateMediaSession(t);save()}
function updateMediaSession(t){
  document.title=`${t.title} — ${t.artist} | Волна`;
  if(!navigator.mediaSession||typeof window.MediaMetadata!=='function')return;
  try{navigator.mediaSession.metadata=new window.MediaMetadata({title:t.title,artist:t.artist,album:`Волна · ${t.genre}`,artwork:t.artwork?[{src:t.artwork,sizes:'480x480'}]:[{src:'wave-icon.svg',sizes:'512x512',type:'image/svg+xml'}]})}catch(error){console.info('MEDIA_SESSION_METADATA_UNAVAILABLE',{error:error.message})}
}
function seekTo(seconds){
  if(!current())return;const binding=currentBinding();sampleListening(binding);elapsed=Math.max(0,Math.min(seconds,current().duration-1));
  if(media&&media.readyState>0){media.currentTime=elapsed;if(binding){binding.event.lastPosition=elapsed;binding.event.lastWallAt=performance.now()}}
  updateProgressUI(elapsed);
}
function handleTrackEnded(element=media,binding=currentBinding()){
  if(element!==media||binding?.event!==playbackController.event||binding?.released)return;
  finalizePlayback(binding?.event,'ended',binding);
  if(state.repeatCurrent&&current()){
    advanceBufferGeneration('repeat',true);if(element){element.currentTime=0;playbackController.bindings.delete(element)}beginPlaybackEvent(current());elapsed=0;updateProgressUI(0);void play();return;
  }
  void next('ended',true);
}
function armPlaybackTimer(){
  clearInterval(timer);timer=setInterval(()=>{
    if(!current()||!playing)return;sampleListening(currentBinding());elapsed=media?Math.floor(media.currentTime):elapsed+.5;
    const duration=Number.isFinite(media?.duration)?media.duration:current().duration,fade=state.repeatCurrent?0:crossfadeSeconds('ended');
    if(!selectionInProgress&&fade>0&&preloadReady&&playbackBuffer.next&&media&&!media.paused&&duration-media.currentTime<=fade)void next('ended');
    if(!media&&elapsed>=duration)handleTrackEnded();updateProgressUI(elapsed);
  },500);
}
async function play(){
  if(!current())return start();ensureWaveAudioContext();
  if(playbackStoppedOnError){playbackStoppedOnError=false;failedTrackIds.clear();return next('error',true)}
  tabChannel?.postMessage('claim-audio');playing=true;setPlayerState(PLAYER_STATES.LOADING);
  if(playbackController.event?.finalized)beginPlaybackEvent(current());
  if('mediaSession'in navigator)navigator.mediaSession.playbackState='playing';
  const started=await sound(current());if(started)armPlaybackTimer();if(!selectionInProgress)void fillPlaybackBuffer();return started;
}
function pause(){
  sampleListening(currentBinding());if(playbackController.event)playbackController.event.active=false;playing=false;clearInterval(timer);
  for(const binding of playbackController.bindings.values()){sampleListening(binding);binding.event.active=false;binding.element?.pause()}
  if(audio)void audio.suspend();setPlayerState(current()?PLAYER_STATES.PAUSED:PLAYER_STATES.IDLE);
  if('mediaSession'in navigator)navigator.mediaSession.playbackState='paused';
}
function progressRatio(){return Math.max(0,Math.min(1,(playbackController.event?.listenedSeconds||0)/(Number(current()?.duration)||1)))}
function recordPlayback(reason){return finalizePlayback(playbackController.event,reason,currentBinding())}
function handlePlayRejection(error,element=media,binding=currentBinding()){
  if(element!==media||binding?.event!==playbackController.event||binding?.released)return;
  if(error?.name==='NotAllowedError'){logPlayback('AUTOPLAY_BLOCKED',{errorName:error.name});showPlayRequired();return}
  if(error?.name==='AbortError')return;
  logPlayback('SOURCE_FAILURE',{errorName:error?.name||null});void recoverPlayback(binding);
}
async function recoverPlayback(binding){
  if(!binding||binding.recovering||binding.released||binding.element!==media||binding.event!==playbackController.event)return;
  if(selectionInProgress){playbackController.recoveryPending=binding;return}
  binding.recovering=true;const track=binding.event.track,previousOperation=playbackController.operation;
  // A later failure during established playback starts its own bounded recovery operation.
  const operation=previousOperation&&!(binding.event.confirmed&&binding.event.listenedSeconds>=10)?previousOperation:newPlaybackOperation('error');
  logPlayback('SOURCE_FAILURE',{failedTrackKey:playbackKey(track),errorCode:binding.element.error?.code??null});
  finalizePlayback(binding.event,'error',binding);clearInterval(timer);
  if(operation.retries>=MAX_PLAYBACK_RETRIES||performance.now()>=operation.deadline){playing=false;playbackStoppedOnError=true;setPlayerState(PLAYER_STATES.ERROR);$('#artist').textContent='Источник аудио недоступен. Нажми ▶, чтобы повторить.';return}
  operation.retries++;playbackRetryCount=operation.retries;
  let recovered=false;
  await runTransition('error',async owner=>{
    advanceBufferGeneration('source-error',false);const token=selectionToken(owner);
    const alternative=(track.alternatives||[]).find(x=>x.source!==track.activeSource&&!failedTrackIds.has(WaveRecommendation.idOf(x)));
    if(alternative&&owner.remainingCandidates>0){
      owner.remainingCandidates--;try{
        const resolved=await operationAwait(sourceManager.resolveTrack({...alternative,alternatives:[]}),owner);
        if(tokenIsCurrent(token)&&media===binding.element){stopSound();const replacement={...track,stream:resolved.stream,streamUrl:resolved.streamUrl,activeSource:resolved.activeSource,waveAnalysisAllowed:false,alternatives:track.alternatives.filter(x=>x!==alternative)};queue[index]=replacement;load();recovered=await play()}
      }catch(error){logPlayback('SOURCE_FAILURE',{failedTrackKey:playbackKey(alternative),errorName:error.name})}
    }
  },operation);
  if(!recovered&&binding.event!==playbackController.event)return;
  if(!recovered){failedTrackIds.add(WaveRecommendation.idOf(track));await next('error',true,operation)}
}
async function sound(t){
  if(!t)return false;
  if(t.stream){
    let prepared=preloadMedia?.dataset.trackId===String(t.id),event=playbackController.event;
    if(prepared){media=preloadMedia;preloadMedia=null;preloadReady=false}
    else if(media?.dataset.trackId!==String(t.id)||playbackController.bindings.get(media)?.event!==event){
      if(media?.dataset.unlock==='true'){media.pause();media.removeAttribute('src')}else{releaseMedia(media);media=new Audio()}
    }
    const element=media;delete element.dataset.unlock;element.dataset.trackId=String(t.id);element.dataset.mediaElementId||='media:'+ ++playbackController.mediaSequence;
    element.preload='auto';element.volume=element.dataset.crossfadeStart?0:+$('#volume').value/100;
    let binding=playbackController.bindings.get(element);
    if(!binding||binding.event!==event){binding={element,event,released:false,recovering:false};playbackController.bindings.set(element,binding)}
    const owns=()=>media===element&&playbackController.event===event&&!binding.released;
    element.onplay=()=>{if(owns())setPlayerState(PLAYER_STATES.LOADING)};
    element.onplaying=()=>{if(!owns())return;startupMark('playing');markPlaying(binding);setPlayerState(PLAYER_STATES.PLAYING);playbackStoppedOnError=false;if(nextStartedAt){logPlayback('NEXT_LATENCY',{latencyMs:Math.round(performance.now()-nextStartedAt)});nextStartedAt=0}};
    element.onwaiting=()=>{sampleListening(binding);event.active=false;if(owns())setPlayerState(PLAYER_STATES.LOADING)};
    element.onstalled=()=>{sampleListening(binding);if(element.readyState<3){event.active=false;if(owns())setPlayerState(PLAYER_STATES.LOADING)}};
    element.onpause=()=>{sampleListening(binding);event.active=false;if(owns()&&!element.ended)setPlayerState(PLAYER_STATES.PAUSED)};
    element.ontimeupdate=()=>sampleListening(binding);
    element.onseeking=()=>{sampleListening(binding);event.active=false};
    element.onseeked=()=>{event.lastPosition=element.currentTime;event.lastWallAt=performance.now();event.active=event.confirmed&&!element.paused&&!element.ended&&element.readyState>=3};
    element.onloadedmetadata=()=>{if(!owns())return;if(Number.isFinite(element.duration)&&element.duration>0)t.duration=element.duration;if(elapsed>0&&elapsed<element.duration)element.currentTime=elapsed;renderPlayerUI()};
    element.oncanplay=()=>{if(owns()){startupMark('canplay');renderPlayerUI()}};element.oncanplaythrough=()=>{if(owns())startupMark('canplaythrough')};
    element.onended=()=>handleTrackEnded(element,binding);
    element.onerror=()=>{sampleListening(binding);event.active=false;if(owns())void recoverPlayback(binding)};
    startupMark('audio_load_start');if(!prepared&&element.src!==t.stream){if(t.waveAnalysisAllowed)element.crossOrigin='anonymous';else element.removeAttribute('crossorigin');element.src=t.stream}
    attachWaveAnalyzer(element,t);
    try{startupMark('play_called');await element.play();return owns()&&!element.paused}catch(error){handlePlayRejection(error,element,binding);return false}
  }
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  if(audio){await audio.resume();markPlaying(playbackController.bindings.get(audio));return true}
  audio=new AC();const binding={element:null,event:playbackController.event,released:false};playbackController.bindings.set(audio,binding);
  let master=audio.createGain();master.gain.value=(+$('#volume').value/100)*.08;waveAnalyzer=audio.createAnalyser();waveAnalyzer.fftSize=256;waveAnalyzer.smoothingTimeConstant=.74;master.connect(waveAnalyzer);waveAnalyzer.connect(audio.destination);waveTrackBpm=clampWaveBpm(t.tempo);
  let root=['Энергия','Вечеринка'].includes(t.mood)?146.83:110,notes=[1,1.25,1.5,2],step=0;
  let pulse=()=>{if(!audio||audio.state!=='running')return;sampleListening(binding);let o=audio.createOscillator(),g=audio.createGain();o.type=t.genre==='Электроника'?'triangle':'sine';o.frequency.value=root*notes[step++%4];g.gain.setValueAtTime(.001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.35,audio.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.48);o.connect(g).connect(master);o.start();o.stop(audio.currentTime+.5)};
  await audio.resume();if(audio.state==='running'){markPlaying(binding);setPlayerState(PLAYER_STATES.PLAYING)}pulse();audio.pulse=setInterval(pulse,60000/t.tempo);return audio.state==='running';
}

function clampWaveBpm(value){let bpm=Number(value)||90;return Math.max(45,Math.min(200,bpm))}
function ensureWaveAudioContext(){let AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{if(!waveAudioContext)waveAudioContext=new AC();if(waveAudioContext.state==='suspended')void waveAudioContext.resume().catch(()=>{});return waveAudioContext}catch(error){console.warn('WAVE_AUDIO_CONTEXT_UNAVAILABLE',{error:error.message});return null}}
function attachWaveAnalyzer(element,track){waveTrackBpm=clampWaveBpm(track.tempo||track.bpm||MOODS.find(m=>m[0]===state.mood)?.[2]);if(!track.waveAnalysisAllowed){waveAnalyzer=null;return false}try{let ctx=ensureWaveAudioContext();if(!ctx)return false;let existing=waveAudioNodes.get(element);if(existing){waveAnalyzer=existing.analyser;return true}let source=ctx.createMediaElementSource(element);source.connect(ctx.destination);let analyser=ctx.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.78;let silent=ctx.createGain();silent.gain.value=0;source.connect(analyser);analyser.connect(silent);silent.connect(ctx.destination);waveAudioNodes.set(element,{source,analyser,silent});element.dataset.waveAnalyzed='true';waveAnalyzer=analyser;return true}catch(error){console.warn('WAVE_ANALYZER_UNAVAILABLE',{source:track.activeSource||track.source,error:error.message});waveAnalyzer=null;return false}}
function stopWaveVisualizer(){if(waveFrame)cancelAnimationFrame(waveFrame);waveFrame=0;waveFrameAt=0;let root=document.documentElement;root.style.setProperty('--wave-energy','.12');root.style.setProperty('--wave-beat','.1');root.style.setProperty('--wave-shift','0px');root.style.setProperty('--wave-scale','1')}
function startWaveVisualizer(){if(!playing||document.hidden||window.matchMedia('(prefers-reduced-motion: reduce)').matches||waveFrame)return;let samples=waveAnalyzer?new Uint8Array(waveAnalyzer.frequencyBinCount):null;const frame=now=>{waveFrame=0;if(!playing||document.hidden)return;if(now-waveFrameAt<34){waveFrame=requestAnimationFrame(frame);return}waveFrameAt=now;let position=Number.isFinite(media?.currentTime)?media.currentTime:elapsed,beat=((position*waveTrackBpm/60)%1+1)%1,pulse=Math.pow((1+Math.cos(beat*Math.PI*2))/2,5),energy=.1+pulse*.35;if(samples&&waveAnalyzer){waveAnalyzer.getByteFrequencyData(samples);let sum=0,end=Math.min(18,samples.length);for(let i=1;i<end;i++)sum+=samples[i];energy=Math.max(.04,Math.min(.85,(sum/Math.max(1,end-1)/255)*1.55))}let root=document.documentElement;root.style.setProperty('--wave-energy',energy.toFixed(3));root.style.setProperty('--wave-beat',pulse.toFixed(3));root.style.setProperty('--wave-shift',(Math.sin(position*2.1)*2.4).toFixed(2)+'px');root.style.setProperty('--wave-scale',(1.012+pulse*.012+energy*.009).toFixed(4));waveFrame=requestAnimationFrame(frame)};waveFrame=requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopWaveVisualizer();return}if(!playing)return;ensureWaveAudioContext();if(media?.paused&&!media.ended)void play();startWaveVisualizer()});
function showPlayRequired(){playing=false;setPlayerState(PLAYER_STATES.PAUSED);clearInterval(timer);$('#artist').textContent='Нажми ▶ для запуска звука';toast('Браузер ждёт нажатия кнопки ▶')}
function stopSound(preserveUnlock=false){if(media&&!(preserveUnlock&&media.dataset.unlock==='true')){releaseMedia(media);media=null}if(audio){sampleListening(playbackController.bindings.get(audio));playbackController.bindings.delete(audio);clearInterval(audio.pulse);void audio.close();audio=null}}
function likeVisual(){let yes=current()&&state.likes.some(x=>WaveRecommendation.idOf(x)===WaveRecommendation.idOf(current()));let desktopIcon=$('#like .control-icon');if(desktopIcon)desktopIcon.textContent=yes?'♥':'♡';document.querySelectorAll('[data-player-action="like"]').forEach(button=>{button.classList.toggle('active',yes);button.setAttribute('aria-label',yes?'Убрать из любимых':'Добавить в любимые')})}
function renderRepeat(){document.querySelectorAll('[data-player-action="repeat"]').forEach(button=>{button.classList.toggle('active',state.repeatCurrent);button.setAttribute('aria-pressed',String(state.repeatCurrent))})}
function toggleRepeat(){state.repeatCurrent=!state.repeatCurrent;save();renderRepeat();toast(state.repeatCurrent?'Повтор текущего трека включён':'Повтор выключен')}
function renderQueue(){let box=$('#queueList');if(!box)return;let tracks=[current(),playbackBuffer.next,playbackBuffer.backupNext].filter(Boolean),labels=['Сейчас','Далее','После'];box.innerHTML=tracks.length?tracks.map((t,i)=>`<div class="queue-item ${i===0?'current':''}"><span>${labels[i]||i+1}</span><i class="queue-art" style="${t.artwork?`background-image:url('${escapeHtml(t.artwork)}')`:`background:${t.color||'#8052ff'}`}"></i><span><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.artist||'Исполнитель')}</small></span></div>`).join(''):'<div class="queue-empty">Запусти волну — здесь появятся следующие треки</div>'}
function toggleLike(){let t=current();if(!t)return;let yes=state.likes.some(x=>WaveRecommendation.idOf(x)===WaveRecommendation.idOf(t));WaveRecommendation.recordEvent(state,waveSession,t,yes?'unlike':'like',{progressRatio:progressRatio(),listenedSeconds:media?.currentTime||elapsed});save();libraries();likeVisual();invalidateNextBuffer('feedback');toast(yes?'Убрано из любимых':'Вкус обновлён — следующий подбор учтёт лайк')}
function list(a,msg){return a.length?a.map(t=>`<div class="track"><i style="--color:${t.color}">♪</i><span><strong>${t.title}</strong><small>${t.artist} · ${t.genre}</small></span><time>${fmt(t.duration)}</time></div>`).join(''):`<div class="empty">${msg}</div>`}
function libraries(){$('#likesList').innerHTML=list(state.likes,'Пока пусто — нажми ♡ у понравившегося трека');$('#historyList').innerHTML=list(state.history,'История появится после запуска волны')}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),1800)}
function syncOverlayLock(){document.body.classList.toggle('overlay-open',document.querySelector('.full-player.open,.bottom-sheet.open')||document.body.classList.contains('search-sheet-open'))}
function showPage(page){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===page));document.querySelectorAll('.desktop-nav [data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===page));if(page==='likes'||page==='history')libraries();window.scrollTo({top:0,behavior:'smooth'})}
function openSearch(){showPage('home');document.body.classList.add('search-sheet-open');syncOverlayLock();setTimeout(()=>$('#musicSearch').focus(),50)}
function closeSearch(){document.body.classList.remove('search-sheet-open');syncOverlayLock()}
function openFullPlayer(){if(!current())return toast('Сначала запусти волну');closeSearch();$('#fullPlayer').classList.add('open');$('#fullPlayer').setAttribute('aria-hidden','false');syncOverlayLock();setTimeout(()=>$('[data-close-player]').focus(),60)}
function closeFullPlayer(){closeSheets();$('#fullPlayer').classList.remove('open');$('#fullPlayer').style.transform='';$('#fullPlayer').setAttribute('aria-hidden','true');syncOverlayLock();document.querySelector('[data-open-player]')?.focus()}
function closeSheets(){document.querySelectorAll('.bottom-sheet,.sheet-backdrop').forEach(x=>x.classList.remove('open'));document.querySelectorAll('.bottom-sheet').forEach(x=>x.setAttribute('aria-hidden','true'));syncOverlayLock()}
function openSheet(sheet){closeSheets();sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');$('.sheet-backdrop').classList.add('open');syncOverlayLock();setTimeout(()=>sheet.querySelector('button')?.focus(),40)}
function showQueue(){renderQueue();openSheet($('#queueSheet'));void fillPlaybackBuffer().then(renderQueue)}
async function shareCurrent(){let t=current();if(!t)return toast('Сначала запусти волну');let data={title:`${t.title} — ${t.artist}`,text:`Слушаю ${t.title} — ${t.artist} в «Волне»`,url:location.href};try{if(navigator.share)await navigator.share(data);else if(navigator.clipboard){await navigator.clipboard.writeText(`${data.text} ${data.url}`);toast('Ссылка скопирована')}else throw Error('share unavailable')}catch(error){if(error?.name!=='AbortError')toast('Не удалось поделиться')}}
function dislikeCurrent(){if(!current())return;recordPlayback('dislike');invalidateNextBuffer('dislike');toast('Дизлайк учтён — выбираем другой трек');void next('dislike',true)}
function resetPreferences(){if(confirm('Сбросить выбранные жанры, настроение, лайки и историю?')){localStorage.removeItem('waveState');location.reload()}}
function runPlayerAction(action){if(action==='play')return playing?pause():play();if(action==='next')return void next('next');if(action==='prev')return prev();if(action==='like')return toggleLike();if(action==='dislike')return dislikeCurrent();if(action==='repeat')return toggleRepeat();if(action==='queue')return showQueue();if(action==='share')return void shareCurrent()}
$('#waveOrb').onclick=()=>playing?pause():current()?play():start();$('#reset').onclick=resetPreferences;document.querySelector('[data-reset-preferences]').onclick=resetPreferences;
document.addEventListener('click',event=>{let action=event.target.closest('[data-player-action]')?.dataset.playerAction;if(action){event.preventDefault();event.stopPropagation();runPlayerAction(action)}});
$('#volume').oninput=()=>{if(media)media.volume=+$('#volume').value/100;else if(playing){stopSound();sound(current())}};
for(let input of [$('#progress'),$('#mobileProgress')])input.oninput=e=>{if(current())seekTo(current().duration*e.target.value/100)};
document.querySelectorAll('.desktop-nav [data-page]').forEach(button=>button.onclick=()=>showPage(button.dataset.page));
document.querySelectorAll('.brand,.top-brand').forEach(link=>link.onclick=event=>{event.preventDefault();showPage('home')});
document.querySelector('[data-open-player]').onclick=openFullPlayer;document.querySelector('[data-close-player]').onclick=closeFullPlayer;document.querySelector('[data-close-search]').onclick=closeSearch;document.querySelectorAll('[data-close-sheet]').forEach(x=>x.onclick=closeSheets);
document.querySelector('[data-copy-diagnostics]').onclick=()=>void copyWaveDiagnostics();
document.querySelector('[data-open-more]').onclick=()=>openSheet($('#moreSheet'));
document.querySelector('[data-sheet-page]').onclick=()=>{closeSheets();showPage('history')};
document.querySelectorAll('[data-mobile-target]').forEach(button=>button.onclick=()=>{let target=button.dataset.mobileTarget;document.querySelectorAll('[data-mobile-target]').forEach(x=>x.classList.toggle('active',x===button));if(target==='search')return openSearch();if(target==='likes')return showPage('likes');if(target==='genres'){closeSearch();showPage('home');return setTimeout(()=>$('#genreSection').scrollIntoView({behavior:'smooth',block:'start'}),50)}if(target==='more')return openSheet($('#moreSheet'));closeSearch();showPage('home')});
let dragStart=null,dragY=0,dragHandle=$('.player-drag-handle');dragHandle.onpointerdown=event=>{dragStart={y:event.clientY,time:performance.now()};dragY=0;dragHandle.setPointerCapture(event.pointerId)};dragHandle.onpointermove=event=>{if(!dragStart)return;dragY=Math.max(0,event.clientY-dragStart.y);$('#fullPlayer').style.transform=`translateY(${dragY}px)`};dragHandle.onpointerup=event=>{if(!dragStart)return;let fast=dragY>35&&performance.now()-dragStart.time<260,close=dragY>85||fast;dragStart=null;dragHandle.releasePointerCapture(event.pointerId);if(close)closeFullPlayer();else $('#fullPlayer').style.transform=''};
document.addEventListener('keydown',event=>{let layer=document.querySelector('.bottom-sheet.open,.full-player.open');if(event.key==='Tab'&&layer){let focusable=[...layer.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href]')].filter(x=>x.offsetParent!==null);if(focusable.length){let first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}return}if(event.key!=='Escape')return;if(document.querySelector('.bottom-sheet.open'))closeSheets();else if($('#fullPlayer').classList.contains('open'))closeFullPlayer();else closeSearch()});
window.addEventListener('scroll',()=>$('#scrollTop').classList.toggle('visible',scrollY>500),{passive:true});$('#scrollTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});setPlayerState(PLAYER_STATES.IDLE);renderRepeat();
if(navigator.mediaSession&&typeof navigator.mediaSession.setActionHandler==='function'){
  const actions={play:()=>play(),pause:()=>pause(),previoustrack:()=>prev(),nexttrack:()=>next(),seekbackward:details=>seekTo(elapsed-(details.seekOffset||10)),seekforward:details=>seekTo(elapsed+(details.seekOffset||10)),seekto:details=>seekTo(details.seekTime||0)};
  for(const [action,handler] of Object.entries(actions))try{navigator.mediaSession.setActionHandler(action,handler)}catch(error){console.info('MEDIA_SESSION_ACTION_UNAVAILABLE',{action,error:error.message})}
}
if(!window.__WAVE_TEST_MODE__&&'serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
if(tabChannel)tabChannel.onmessage=event=>{if(event.data==='claim-audio'&&playing){pause();toast('Музыка продолжилась в другой вкладке')}};
window.addEventListener('pageshow',event=>{if(event.persisted){renderPlayerUI();updateProgressUI(elapsed)}});
window.onbeforeunload=stopSound;choices();libraries();
