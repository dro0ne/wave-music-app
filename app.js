const WAVE_BUILD='anti-repeat-20260923';
window.WAVE_BUILD=WAVE_BUILD;
document.documentElement.dataset.build=WAVE_BUILD;
console.info('WAVE BUILD:',WAVE_BUILD);
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
state.likes ||= []; state.history ||= []; state.dislikes ||= []; state.taste ||= {genres:{},artists:{}};state.trackStats||={};
let waveSession=WaveRecommendation.createSession(state.waveSession||{currentMood:state.mood,noveltyLevel:state.discovery/100});
let queue=[],index=0,catalog=[],catalogLoadedAt=0,playing=false,elapsed=0,timer,audio,media,playbackRetryCount=0,playbackStoppedOnError=false,playedSinceCatalogRefresh=0,catalogRefreshInFlight=false;
let failedTrackIds=new Set();
const MAX_PLAYBACK_RETRIES=2;
const MAX_STREAM_VALIDATION_CANDIDATES=8;
const PLAYABLE_CACHE_TTL=12*60*1000;
let verifiedPlayableTrackIds=new Map(),selectionInProgress=false;
window.__lastWaveSelections=[];
let genreQuery='';
let searchResults=[],searchTimer,searchRequest=0;
const tabChannel='BroadcastChannel'in window?new BroadcastChannel('wave-player'):null;
const $=s=>document.querySelector(s), save=()=>{state.waveSession=waveSession;localStorage.setItem('waveState',JSON.stringify(state))};
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
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
$('#moods').onclick=e=>{let b=e.target.closest('[data-mood]');if(b&&state.mood!==b.dataset.mood){state.mood=b.dataset.mood;WaveRecommendation.updateWavePreferences(waveSession,{mood:state.mood});save();choices();void loadCatalog(true);toast('Настроение обновлено — повлияет на следующий трек')}};
$('#genres').onclick=e=>{let b=e.target.closest('[data-genre]');if(!b)return;let g=b.dataset.genre;state.genres=state.genres.includes(g)?state.genres.filter(x=>x!==g):[...state.genres,g];save();choices();void loadCatalog(true);toast('Жанры обновлены — повлияют на следующий трек')};
$('#genreSearch').oninput=e=>{genreQuery=e.target.value.trim().toLocaleLowerCase('ru');choices()};
function renderMusicResults(message=''){
  let box=$('#musicResults');
  if(message){box.innerHTML=`<div class="search-message">${escapeHtml(message)}</div>`;box.classList.add('open');return}
  if(!searchResults.length){box.classList.remove('open');box.innerHTML='';return}
  box.innerHTML=searchResults.map((t,i)=>`<button class="music-result" data-search-index="${i}"><img src="${escapeHtml(t.artwork?.['150x150']||t.artwork?.['480x480']||'wave-icon.svg')}" alt=""><span><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.user?.name||'Исполнитель')}${t.album_name?` · Альбом: ${escapeHtml(t.album_name)}`:''}</small></span><i>▶</i></button>`).join('');box.classList.add('open')
}
async function searchMusic(value){
  let query=value.trim(),request=++searchRequest;if(query.length<2){searchResults=[];renderMusicResults();return}
  renderMusicResults('Ищем треки и альбомы…');
  try{let response=await fetch(`https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=12`,{signal:AbortSignal.timeout(9000)});if(!response.ok)throw Error(response.status);let json=await response.json();if(request!==searchRequest)return;searchResults=(json.data||[]).filter(openAudius);renderMusicResults(searchResults.length?'':'Ничего не найдено')}
  catch{if(request===searchRequest){searchResults=[];renderMusicResults('Поиск временно недоступен')}}
}
$('#musicSearch').oninput=e=>{clearTimeout(searchTimer);let value=e.target.value;if(value.trim().length<2){searchRequest++;searchResults=[];renderMusicResults();return}searchTimer=setTimeout(()=>searchMusic(value),320)};
$('#musicResults').onclick=async e=>{let button=e.target.closest('[data-search-index]');if(!button||selectionInProgress)return;let track=searchResults[+button.dataset.searchIndex];if(!track)return;selectionInProgress=true;let m=MOODS.find(x=>x[0]===state.mood)||MOODS[0],candidate=normalize({...track,_reason:track.album_name?`Альбом: ${track.album_name}`:'Найдено через поиск'},m),selected=WaveRecommendation.scoreTrack(candidate,recommendationContext());catalog=[candidate,...searchResults.map(t=>normalize(t,m)),...catalog].filter((t,i,a)=>a.findIndex(x=>WaveRecommendation.idOf(x)===WaveRecommendation.idOf(t))===i);pause();$('#player').classList.add('visible');$('#title').textContent='Подбираем доступный трек…';$('#artist').textContent='Проверяем источник аудио';let playable;try{playable=await validateCandidate(selected,1)}finally{selectionInProgress=false}if(!playable)return toast('Этот аудиопоток недоступен');queue=[selectedTrack(selected,playable)];index=0;load();void play();$('#musicResults').classList.remove('open')};
document.addEventListener('click',e=>{if(!e.target.closest('.music-search'))$('#musicResults').classList.remove('open')});
$('#discovery').value=state.discovery;paintRange($('#discovery'));
$('#discovery').oninput=e=>{state.discovery=+e.target.value;WaveRecommendation.updateWavePreferences(waveSession,{noveltyLevel:state.discovery/100});$('#discoverText').textContent=state.discovery<35?'В основном музыка, похожая на любимую':state.discovery>65?'Больше незнакомых исполнителей':'Поровну знакомого и новых открытий';save()};
$('#discovery').onchange=()=>toast('Баланс обновлён — повлияет на следующий трек');
function fallbackQueue(){let m=MOODS.find(x=>x[0]===state.mood)||MOODS[0];return Array.from({length:9},(_,i)=>({title:TITLES[(i+Math.floor(Math.random()*9))%9],artist:ARTISTS[Math.floor(Math.random()*7)],genre:state.genres[i%Math.max(1,state.genres.length)]||'Разное',mood:m[0],tempo:m[2]+(i%3-1)*5,color:m[3],duration:105+(i*13)%76,reason:'Локальный демо-режим',source:'Local Demo'}))}
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const genreMap=Object.fromEntries(GENRE_PAIRS);
const moodMap={'Спокойствие':['peaceful','chill','cool','relaxing'],'Энергия':['energizing','fiery','excited','upbeat'],'Фокус':['focused','sophisticated','serious'],'Мечтательно':['dreamy','romantic','sentimental','yearning'],'Вечеринка':['party','excited','upbeat','energizing']};
function normalize(t,m){let source=t.source||'Audius';return {id:t.id,title:t.title,artist:t.user?.name||t.artist||'Audius Artist',album:t.album_name||t.album||'',genre:t.genre||'Разное',mood:t.mood||'',tempo:Number(t.bpm||t.tempo)||null,energy:Number.isFinite(+t.energy)?+t.energy:null,valence:Number.isFinite(+t.valence)?+t.valence:null,tags:t.tags||'',color:m[3],duration:t.duration||180,artwork:t.artwork?.['480x480']||t.artwork,stream:source==='Audius'?'':t.stream||'',releaseDate:t.release_date||t.releaseDate,reason:t._reason||t.reason||'Подобрано для тебя',source}}
function releaseLabel(value){if(!value)return '';let date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
const openAudius=t=>t.is_available!==false&&t.access?.stream!==false&&!t.stream_conditions&&!t.is_stream_gated&&!t.is_unlisted&&!t.is_delete&&!!t.track_cid;
async function fetchArchiveTracks(query){
  let q=encodeURIComponent(`mediatype:audio AND format:"VBR MP3" AND licenseurl:[* TO *] AND (${query||'music'})`),url=`https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl&rows=8&output=json`;
  let search=await fetch(url,{signal:AbortSignal.timeout(9000)}).then(r=>r.json()),docs=search.response?.docs||[];
  let items=await Promise.all(docs.map(async doc=>{try{let meta=await fetch(`https://archive.org/metadata/${encodeURIComponent(doc.identifier)}`,{signal:AbortSignal.timeout(9000)}).then(r=>r.json());let file=(meta.files||[]).find(f=>['VBR MP3','MP3'].includes(f.format)&&f.name&&!f.name.includes('_64kb'));if(!file)return null;return{id:`ia:${doc.identifier}`,title:doc.title||file.title||doc.identifier,artist:Array.isArray(doc.creator)?doc.creator[0]:doc.creator||'Internet Archive',genre:query||'Открытая музыка',duration:Math.round(+file.length)||180,artwork:`https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`,stream:`https://archive.org/download/${encodeURIComponent(doc.identifier)}/${file.name.split('/').map(encodeURIComponent).join('/')}`,source:'Internet Archive',_reason:'Открытая лицензия · Internet Archive'}}catch{return null}}));
  return items.filter(Boolean)
}
async function loadCatalog(force=false,merge=false,quiet=false){
  if(catalog.length&&!force&&Date.now()-catalogLoadedAt<15*60*1000)return catalog;
  let m=MOODS.find(x=>x[0]===state.mood)||MOODS[0];
  try{
    let stamp=Date.now(),genreRequests=state.genres.slice(0,8).map(label=>[label,genreMap[label]||label]),moodRequests=(moodMap[state.mood]||[]).slice(0,2);
    let urls=[`https://api.audius.co/v1/tracks/trending?limit=100&_=${stamp}`,`https://api.audius.co/v1/tracks/latest?limit=100&_=${stamp}`,`https://api.audius.co/v1/tracks/feeling-lucky?limit=100&_=${stamp}`,...genreRequests.map(([,query])=>`https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=50&_=${stamp}`),...moodRequests.map(query=>`https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=35&_=${stamp}`)];
    let [results,archive]=await Promise.all([Promise.all(urls.map(u=>fetch(u,{signal:AbortSignal.timeout(9000)}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).catch(()=>({data:[]})))),fetchArchiveTracks(genreRequests[0]?.[1]||'music').catch(()=>[])]);
    let source=[...(results[0].data||[]),...(results[1].data||[]),...(results[2].data||[]),...results.slice(3).flatMap(x=>x.data||[]),...archive].filter(t=>t.source==='Internet Archive'||openAudius(t));
    let unique=new Map([...(merge?catalog:[]),...state.likes,...source].map(t=>[t.id||`${t.artist}-${t.title}`,normalize(t,m)]));
    catalog=[...unique.values()];if(!catalog.length)throw Error('Каталог временно недоступен');catalogLoadedAt=Date.now();
  }catch(error){if(merge&&catalog.length)return catalog;catalog=fallbackQueue().map(t=>normalize(t,m));catalogLoadedAt=Date.now();if(!quiet)toast('Нет связи — включён локальный демо-режим')}
  return catalog;
}
function maybeReplenishCatalog(event,listenedSeconds){
  if(event==='error'||catalogRefreshInFlight)return;
  if(event==='ended'||listenedSeconds>=10)playedSinceCatalogRefresh++;
  let available=WaveRecommendation.eligibleCandidates(catalog,waveSession).candidates.length;
  if(playedSinceCatalogRefresh<12&&available>=15)return;
  playedSinceCatalogRefresh=0;catalogRefreshInFlight=true;void loadCatalog(true,true,true).finally(()=>{catalogRefreshInFlight=false});
}
function recommendationContext(){return {state,session:waveSession,selectedGenres:state.genres}}
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
async function probeStreamWithAudio(url){
  return new Promise((resolve,reject)=>{let probe=new Audio(),done=false,timer=setTimeout(()=>finish(false,Error('audio probe timeout')),8000),finish=(ok,value)=>{if(done)return;done=true;clearTimeout(timer);probe.pause();probe.removeAttribute('src');probe.load();ok?resolve(value):reject(value)};probe.muted=true;probe.preload='metadata';probe.onloadedmetadata=()=>finish(true,{status:0,contentType:'audio/browser-probe',validation:'audio-probe'});probe.oncanplay=()=>finish(true,{status:0,contentType:'audio/browser-probe',validation:'audio-probe'});probe.onerror=()=>finish(false,Error(`media ${probe.error?.code||0}: ${probe.error?.message||'stream error'}`));probe.src=url;probe.load()})
}
async function validateStreamUrl(url){
  try{
    let response=await fetch(url,{headers:{Range:'bytes=0-2047'},cache:'no-store',signal:AbortSignal.timeout(8000)}),contentType=(response.headers.get('content-type')||'').toLowerCase(),result={status:response.status,contentType,validation:'range-get'};
    if(response.body)void response.body.cancel();
    if(![200,206].includes(response.status)||!contentType.startsWith('audio/'))throw Object.assign(Error(`stream HTTP ${response.status}, type ${contentType||'missing'}`),{httpResult:result});
    return result;
  }catch(error){if(error?.httpResult)throw error;return probeStreamWithAudio(url)}
}
async function validateAudiusStream(track,rank,score){
  let id=WaveRecommendation.idOf(track),url;
  try{url=await resolveAudiusStream(id)}catch(error){console.warn('STREAM_RESOLVE_FAILED',{trackId:id,title:track.title,rank,error:error.message});failedTrackIds.add(id);return null}
  try{let result=await validateStreamUrl(url);console.log('STREAM_VALIDATE_OK',{trackId:id,status:result.status,contentType:result.contentType,source:track.source,validation:result.validation});verifiedPlayableTrackIds.set(id,Date.now()+PLAYABLE_CACHE_TTL);return {...track,stream:url}}
  catch(error){console.warn('STREAM_VALIDATE_FAILED',{trackId:id,title:track.title,rank,status:error?.httpResult?.status||0,error:error.message});failedTrackIds.add(id);return null}
}
async function validateCandidate(selected,rank){
  let track=selected.track,id=WaveRecommendation.idOf(track),cached=(verifiedPlayableTrackIds.get(id)||0)>Date.now();
  console.log('STREAM_VALIDATE_START',{trackId:id,title:track.title,rank,score:+selected.finalScore.toFixed(4)});
  if(track.source==='Local Demo')return track;
  if(track.source==='Audius'){
    if(!cached)return validateAudiusStream(track,rank,+selected.finalScore.toFixed(4));
    try{let url=await resolveAudiusStream(id);console.log('STREAM_VALIDATE_OK',{trackId:id,status:'cached',contentType:'audio/verified',source:track.source,validation:'ttl-cache'});return {...track,stream:url}}
    catch(error){console.warn('STREAM_RESOLVE_FAILED',{trackId:id,title:track.title,rank,error:error.message});failedTrackIds.add(id);return null}
  }
  try{let result=await validateStreamUrl(track.stream);console.log('STREAM_VALIDATE_OK',{trackId:id,status:result.status,contentType:result.contentType,source:track.source,validation:result.validation});verifiedPlayableTrackIds.set(id,Date.now()+PLAYABLE_CACHE_TTL);return track}
  catch(error){console.warn('STREAM_VALIDATE_FAILED',{trackId:id,title:track.title,rank,status:error?.httpResult?.status||0,error:error.message});failedTrackIds.add(id);return null}
}
function selectedTrack(selected,track){
  waveSession.currentTrackId=WaveRecommendation.idOf(track);if(!waveSession.seedTrackId)waveSession.seedTrackId=waveSession.currentTrackId;
  let t={...track,reason:`${selected.selectionType} · настроение ${selected.moodScore.toFixed(2)} · новизна ${selected.userNoveltyScore.toFixed(2)}`};
  let debug={track_id:t.id,track_name:t.title,artist:t.artist,preference_score:+selected.preferenceScore.toFixed(4),preference_weight:selected.preferenceWeight,similarity_score:+selected.similarityScore.toFixed(4),similarity_weight:selected.similarityWeight,mood_score:+selected.moodScore.toFixed(4),mood_weight:selected.moodWeight,user_novelty_score:+selected.userNoveltyScore.toFixed(4),user_novelty_weight:selected.userNoveltyWeight,release_novelty_score:+selected.releaseNoveltyScore.toFixed(4),release_novelty_weight:selected.releaseNoveltyWeight,diversity_score:+selected.diversityScore.toFixed(4),diversity_weight:selected.diversityWeight,final_score:+selected.finalScore.toFixed(4),repeat_penalty:+selected.repeatPenalty.toFixed(4),artist_repeat_penalty:+selected.artistRepeatPenalty.toFixed(4),current_mood:waveSession.currentMood,novelty_level:waveSession.noveltyLevel,selection_type:selected.selectionType};
  let chosenId=WaveRecommendation.idOf(t),selectionLog={chosenId,chosenTitle:t.title,recentTrackIds:waveSession.previousTracks.slice(-WAVE_RECOMMENDATION_CONFIG.hardTrackBlock).map(x=>String(x.id)),hardBlockedCount:selected.hardBlockedCount,eligibleCandidateCount:selected.eligibleCandidateCount,candidatePoolSize:selected.candidatePoolSize,rankBeforeSampling:selected.rankBeforeSampling,sampledPosition:selected.sampledPosition,finalScore:+selected.finalScore.toFixed(4),selectionType:selected.selectionType};
  window.__lastWaveSelections=[...window.__lastWaveSelections,chosenId].slice(-30);window.__lastWaveSelectionDebug=selectionLog;window.__lastSelectionDebug=debug;console.table(debug);console.log('WAVE_SELECTION',selectionLog);return t;
}
async function choosePlayableTrack(){
  let candidates=catalog.filter(t=>!failedTrackIds.has(WaveRecommendation.idOf(t))&&(t.source==='Audius'||!!t.stream||t.source==='Local Demo'));
  let context=recommendationContext(),eligible=WaveRecommendation.eligibleCandidates(candidates,waveSession),ranked=WaveRecommendation.getRankedCandidates(eligible.candidates,context,WAVE_RECOMMENDATION_CONFIG.candidateTopK),weighted=WaveRecommendation.getWeightedCandidateOrder(candidates,context,WAVE_RECOMMENDATION_CONFIG.candidateTopK),local=weighted.find(x=>x.track.source==='Local Demo'),ordered=weighted.filter(x=>x.track.source!=='Local Demo').slice(0,MAX_STREAM_VALIDATION_CANDIDATES);if(local)ordered.push(local);
  window.__lastCandidateRanking=ranked.slice(0,10).map((x,i)=>({rank:i+1,trackId:WaveRecommendation.idOf(x.track),title:x.track.title,score:+x.finalScore.toFixed(4),source:x.track.source}));
  window.__lastStreamValidation=[];
  for(let i=0;i<ordered.length;i++){let selected=ordered[i],playable=await validateCandidate(selected,i+1);window.__lastStreamValidation.push({rank:i+1,trackId:WaveRecommendation.idOf(selected.track),title:selected.track.title,score:+selected.finalScore.toFixed(4),source:selected.track.source,playable:!!playable});if(playable)return selectedTrack(selected,playable)}
  return null;
}
window.waveDebugSummary=()=>{let tracks=window.__lastWaveSelections.slice(-30),positions=new Map(),repeatingIds=new Set(),minimumRepeatDistance=null;tracks.forEach((id,index)=>{if(positions.has(id)){repeatingIds.add(id);let distance=index-positions.get(id);minimumRepeatDistance=minimumRepeatDistance===null?distance:Math.min(minimumRepeatDistance,distance)}positions.set(id,index)});let eligible=WaveRecommendation.eligibleCandidates(catalog.filter(t=>!failedTrackIds.has(WaveRecommendation.idOf(t))),waveSession);return {lastTracks:tracks,uniqueCount:new Set(tracks).size,repeatingIds:[...repeatingIds],minimumRepeatDistance,catalogSize:catalog.length,eligiblePoolSize:eligible.candidates.length,hardBlockWindow:eligible.windowSize}};
const current=()=>queue[index], fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
function unlockPlayback(){
  if(media)return;
  media=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
  media.dataset.unlock='true';media.volume=0;media.play().catch(()=>{});
}
async function start(){if(selectionInProgress)return;selectionInProgress=true;unlockPlayback();failedTrackIds.clear();verifiedPlayableTrackIds.clear();playbackRetryCount=0;playbackStoppedOnError=false;let button=$('#start');button.disabled=true;button.querySelector('strong').textContent='Настраиваем волну…';$('#player').classList.add('visible');$('#title').textContent='Подбираем доступный трек…';$('#artist').textContent='Проверяем источники аудио';try{await loadCatalog(true);let first=await choosePlayableTrack();if(!first)return toast('Не удалось подобрать трек с доступным аудио');queue=[first];index=0;load();void play()}finally{selectionInProgress=false;button.disabled=false;button.querySelector('strong').textContent='Перезапустить мою волну'}}
function load(){let t=current();if(!t)return;stopSound(true);elapsed=0;waveSession.currentTrackId=WaveRecommendation.idOf(t);$('#title').textContent=t.title;$('#artist').textContent=`${t.artist} · ${t.genre} · ${t.reason}`;$('.cover').style.background=t.artwork?`center/cover url("${t.artwork}")`:`linear-gradient(135deg,${t.color},#17131e)`;$('#duration').textContent=fmt(t.duration);$('#time').textContent='0:00';$('#progress').value=0;paintRange($('#progress'));updateMediaSession(t);save();likeVisual()}
function updateMediaSession(t){
  document.title=`${t.title} — ${t.artist} | Волна`;
  if(!('mediaSession'in navigator))return;
  navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:`Волна · ${t.genre}`,artwork:t.artwork?[{src:t.artwork,sizes:'480x480'}]:[{src:'wave-icon.svg',sizes:'512x512',type:'image/svg+xml'}]});
}
function seekTo(seconds){if(!current())return;elapsed=Math.max(0,Math.min(seconds,current().duration-1));if(media&&media.readyState>0)media.currentTime=elapsed;$('#time').textContent=fmt(Math.floor(elapsed));$('#progress').value=elapsed/current().duration*100;paintRange($('#progress'))}
async function play(){if(!current())return start();if(playbackStoppedOnError){if(selectionInProgress)return;selectionInProgress=true;$('#title').textContent='Подбираем доступный трек…';$('#artist').textContent='Проверяем источники аудио';let replacement;try{replacement=await choosePlayableTrack()}finally{selectionInProgress=false}playbackStoppedOnError=false;playbackRetryCount=0;if(!replacement){$('#artist').textContent='Нет доступных аудиопотоков';return toast('Не удалось найти доступный трек')};queue=queue.slice(0,index+1);queue.push(replacement);index=queue.length-1;load()}tabChannel?.postMessage('claim-audio');playing=true;document.body.classList.add('wave-playing');$('#play .control-icon').textContent='Ⅱ';$('#play').setAttribute('aria-label','Пауза');if('mediaSession'in navigator)navigator.mediaSession.playbackState='playing';sound(current());clearInterval(timer);timer=setInterval(()=>{elapsed=media?Math.floor(media.currentTime):elapsed+1;if(elapsed>=current().duration)return next('ended');$('#time').textContent=fmt(elapsed);$('#progress').value=elapsed/current().duration*100;paintRange($('#progress'))},1000)}
function pause(){playing=false;document.body.classList.remove('wave-playing');$('#play .control-icon').textContent='▶';$('#play').setAttribute('aria-label','Воспроизвести');if('mediaSession'in navigator)navigator.mediaSession.playbackState='paused';clearInterval(timer);if(media)media.pause();else stopSound()}
function progressRatio(){let duration=Number(current()?.duration)||1,position=media&&Number.isFinite(media.currentTime)?media.currentTime:elapsed;return Math.max(0,Math.min(1,position/duration))}
function recordPlayback(event){let ratio=event==='ended'?1:progressRatio(),listenedSeconds=event==='ended'?Number(current()?.duration)||elapsed:media&&Number.isFinite(media.currentTime)?media.currentTime:elapsed;WaveRecommendation.recordEvent(state,waveSession,current(),event,{progressRatio:ratio,listenedSeconds});maybeReplenishCatalog(event,listenedSeconds);save();libraries()}
async function next(event='next',alreadyRecorded=false){if(!current())return start();if(selectionInProgress)return;selectionInProgress=true;let resume=playing;pause();if(!alreadyRecorded)recordPlayback(event);$('#title').textContent='Подбираем доступный трек…';$('#artist').textContent='Проверяем источники аудио';let chosen;try{chosen=await choosePlayableTrack()}finally{selectionInProgress=false}if(!chosen)return toast('Не удалось подобрать следующий трек с доступным аудио');if(event!=='error')playbackRetryCount=0;playbackStoppedOnError=false;queue=queue.slice(0,index+1);queue.push(chosen);index=queue.length-1;load();if(resume||event==='next'||event==='ended'||event==='skip'||event==='dislike'||event==='error')void play()}
function prev(){pause();index=(index-1+queue.length)%queue.length;load();play()}
function handlePlayRejection(error){if(error?.name==='NotAllowedError')return showPlayRequired();if(error?.name==='AbortError')return;setTimeout(()=>{if(!media?.error){playing=false;document.body.classList.remove('wave-playing');$('#play .control-icon').textContent='▶';clearInterval(timer);console.warn('PLAYBACK_START_REJECTED',{name:error?.name,message:error?.message});$('#artist').textContent='Не удалось запустить аудио. Нажми ▶, чтобы повторить.'}},0)}
function sound(t){
  if(t.stream&&media?.dataset.trackId===String(t.id)){media.play().catch(handlePlayRejection);return}
  if(t.stream){
    let unlocked=media?.dataset.unlock==='true';if(!unlocked){stopSound();media=new Audio()}else{media.pause();media.removeAttribute('src')};delete media.dataset.unlock;media.dataset.trackId=String(t.id);media.preload='auto';media.volume=+$('#volume').value/100;media.onended=()=>next('ended');
    let originalMeta=$('#artist').textContent,loadTimer=setTimeout(()=>{$('#artist').textContent='Загружаем аудио… обычно 2–5 секунд'},700);
    media.onloadedmetadata=()=>{if(elapsed>0&&elapsed<media.duration)media.currentTime=elapsed};
    media.oncanplay=()=>{clearTimeout(loadTimer);$('#artist').textContent=originalMeta};media.onplaying=()=>{$('#play .control-icon').textContent='Ⅱ';playbackRetryCount=0;playbackStoppedOnError=false};
    media.onerror=()=>{clearTimeout(loadTimer);let failed=current(),error=media?.error,wasPlaying=playing;failedTrackIds.add(WaveRecommendation.idOf(failed));console.warn('PLAYBACK_FAILED',{trackId:failed?.id,title:failed?.title,artist:failed?.artist,stream:failed?.stream,mediaErrorCode:error?.code||0,mediaErrorMessage:error?.message||'',networkState:media?.networkState,readyState:media?.readyState});playing=false;document.body.classList.remove('wave-playing');$('#play .control-icon').textContent='▶';clearInterval(timer);if(wasPlaying&&playbackRetryCount<MAX_PLAYBACK_RETRIES){playbackRetryCount++;console.log('PLAYBACK_RETRY',{attempt:playbackRetryCount,maxAttempts:MAX_PLAYBACK_RETRIES});toast(`Поток недоступен — попытка ${playbackRetryCount} из ${MAX_PLAYBACK_RETRIES}`);setTimeout(()=>next('error',true),500)}else{playbackStoppedOnError=true;$('#artist').textContent='Не удалось получить аудио от источника. Нажми ▶, чтобы попробовать другой трек.';toast('Источник аудио недоступен — автоматические попытки остановлены')}};
    media.src=t.stream;media.play().catch(error=>{clearTimeout(loadTimer);handlePlayRejection(error)});return
  }
  let AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();let master=audio.createGain();master.gain.value=(+$('#volume').value/100)*.08;master.connect(audio.destination);let root=['Энергия','Вечеринка'].includes(t.mood)?146.83:110,notes=[1,1.25,1.5,2],step=0;let pulse=()=>{if(!audio)return;let o=audio.createOscillator(),g=audio.createGain();o.type=t.genre==='Электроника'?'triangle':'sine';o.frequency.value=root*notes[step++%4];g.gain.setValueAtTime(.001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.35,audio.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.48);o.connect(g).connect(master);o.start();o.stop(audio.currentTime+.5)};pulse();audio.pulse=setInterval(pulse,60000/t.tempo)}
function showPlayRequired(){playing=false;document.body.classList.remove('wave-playing');$('#play .control-icon').textContent='▶';clearInterval(timer);$('#artist').textContent='Нажми ▶ для запуска звука';toast('Браузер ждёт нажатия кнопки ▶')}
function stopSound(preserveUnlock=false){if(media&&!(preserveUnlock&&media.dataset.unlock==='true')){media.onended=null;media.onerror=null;media.oncanplay=null;media.onplaying=null;media.pause();media.removeAttribute('src');media.load();media=null}if(audio){clearInterval(audio.pulse);audio.close();audio=null}}
function likeVisual(){let yes=current()&&state.likes.some(x=>WaveRecommendation.idOf(x)===WaveRecommendation.idOf(current()));$('#like .control-icon').textContent=yes?'♥':'♡';$('#like').classList.toggle('liked',yes);$('#like').setAttribute('aria-label',yes?'Убрать из любимых':'Добавить в любимые')}
function toggleLike(){let t=current();if(!t)return;let yes=state.likes.some(x=>WaveRecommendation.idOf(x)===WaveRecommendation.idOf(t));WaveRecommendation.recordEvent(state,waveSession,t,yes?'unlike':'like',{progressRatio:progressRatio(),listenedSeconds:media?.currentTime||elapsed});save();libraries();likeVisual();toast(yes?'Убрано из любимых':'Вкус обновлён — следующий подбор учтёт лайк')}
function list(a,msg){return a.length?a.map(t=>`<div class="track"><i style="--color:${t.color}">♪</i><span><strong>${t.title}</strong><small>${t.artist} · ${t.genre}</small></span><time>${fmt(t.duration)}</time></div>`).join(''):`<div class="empty">${msg}</div>`}
function libraries(){$('#likesList').innerHTML=list(state.likes,'Пока пусто — нажми ♡ у понравившегося трека');$('#historyList').innerHTML=list(state.history,'История появится после запуска волны')}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),1800)}
$('#start').onclick=start;$('#waveOrb').onclick=()=>playing?pause():start();$('#play').onclick=()=>playing?pause():play();$('#next').onclick=()=>next('next');$('#prev').onclick=prev;$('#like').onclick=toggleLike;$('#dislike').onclick=()=>{if(!current())return;recordPlayback('dislike');toast('Дизлайк учтён — выбираем другой трек');next('dislike',true)};$('#volume').oninput=()=>{if(media)media.volume=+$('#volume').value/100;else if(playing){stopSound();sound(current())}};$('#progress').oninput=e=>{if(current()){elapsed=Math.round(current().duration*e.target.value/100);if(media)media.currentTime=elapsed;$('#time').textContent=fmt(elapsed)}};$('#reset').onclick=()=>{if(confirm('Сбросить выбранные жанры, настроение, лайки и историю?')){localStorage.removeItem('waveState');location.reload()}};
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
