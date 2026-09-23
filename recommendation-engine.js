(function(global){
  const C=global.WAVE_RECOMMENDATION_CONFIG;
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
  const lower=value=>String(value||'').toLowerCase();
  const idOf=t=>String(t?.id||`${t?.artist||''}-${t?.title||''}`);
  const lerp=(a,b,t)=>a+(b-a)*t;
  const daysSince=value=>{let time=new Date(value||0).getTime();return time?Math.max(0,(Date.now()-time)/86400000):9999};
  const trackText=t=>lower([t.genre,t.mood,t.tags,t.title,t.artist].filter(Boolean).join(' '));
  function createSession(saved={}){
    return {userId:saved.userId||'local-user',seedTrackId:saved.seedTrackId||null,currentMood:saved.currentMood||'Спокойствие',noveltyLevel:clamp(Number(saved.noveltyLevel??.5)),startedAt:saved.startedAt||new Date().toISOString(),currentTrackId:saved.currentTrackId||null,previousTracks:Array.isArray(saved.previousTracks)?saved.previousTracks.slice(-C.historyWindow):[]};
  }
  function updateWavePreferences(session,patch){if(patch.mood!==undefined)session.currentMood=patch.mood;if(patch.noveltyLevel!==undefined)session.noveltyLevel=clamp(Number(patch.noveltyLevel));return session}
  function ensureStats(state,id){state.trackStats||={};return state.trackStats[id]||={plays:0,completed:0,skips:0,likes:0,dislikes:0,lastPlayedAt:null,recentPlayDates:[]}}
  function changeTaste(state,track,artistSignal,genreSignal){state.taste||={genres:{},artists:{}};state.taste.genres||={};state.taste.artists||={};state.taste.genres[track.genre]=(state.taste.genres[track.genre]||0)+genreSignal;state.taste.artists[track.artist]=(state.taste.artists[track.artist]||0)+artistSignal}
  function addToHistory(state,track){state.history||=[];let id=idOf(track);if(idOf(state.history[0])!==id)state.history=[track,...state.history.filter(x=>idOf(x)!==id)].slice(0,20)}
  function recordEvent(state,session,track,event,details=0){
    if(!track||event==='error')return;let id=idOf(track),stats=ensureStats(state,id),now=new Date().toISOString(),ratio=clamp(typeof details==='number'?details:details.progressRatio||0),listenedSeconds=Math.max(0,typeof details==='object'?(details.listenedSeconds||0):ratio*(Number(track.duration)||0));
    if(['ended','next','skip','dislike'].includes(event)){
      stats.plays++;stats.lastPlayedAt=now;stats.recentPlayDates=[now,...(stats.recentPlayDates||[]).filter(x=>daysSince(x)<7)].slice(0,20);
      if(event==='ended'||ratio>=.85)stats.completed++;
      if(event!=='error'&&(event==='dislike'||ratio<.15))stats.skips+=2;else if(event!=='error'&&ratio<.5)stats.skips+=1;
      if(event!=='error'){
        if(event==='dislike')changeTaste(state,track,C.feedback.dislikeArtistSignal,C.feedback.dislikeGenreSignal);
        else {let signal=ratio<.15?-1:ratio<.5?-.35:ratio<.85?.15:1;changeTaste(state,track,signal*.65,signal*.22)}
      }
      session.previousTracks.push({id,title:track.title,artist:track.artist,album:track.album||track.albumName||'',genre:track.genre,playedAt:now,progressRatio:ratio,event});session.previousTracks=session.previousTracks.slice(-C.historyWindow);
      if(event!=='error'&&listenedSeconds>0)addToHistory(state,track);
    }
    if(event==='like'){state.likes||=[];if(!state.likes.some(x=>idOf(x)===id))state.likes=[track,...state.likes];stats.likes++;changeTaste(state,track,C.feedback.likeArtistSignal,C.feedback.likeGenreSignal)}
    if(event==='unlike'){state.likes=(state.likes||[]).filter(x=>idOf(x)!==id);stats.likes=Math.max(0,stats.likes-1);changeTaste(state,track,-C.feedback.likeArtistSignal,-C.feedback.likeGenreSignal)}
    if(event==='dislike'){state.dislikes||=[];if(!state.dislikes.includes(id))state.dislikes.push(id);stats.dislikes++}
  }
  function tasteCompatibility(track,state,selectedGenres=[]){
    let genre=state.taste?.genres?.[track.genre]||0,artist=state.taste?.artists?.[track.artist]||0,liked=(state.likes||[]).some(x=>idOf(x)===idOf(track));
    let selected=selectedGenres.some(g=>lower(track.genre).includes(lower(g))||lower(g).includes(lower(track.genre)));
    return clamp(.58+genre*.055+artist*.065+(liked?.22:0)+(selected?.20:0),.18,1.35);
  }
  function preferenceScore(track,state,selectedGenres){return tasteCompatibility(track,state,selectedGenres)}
  function similarityScore(track,session,state){
    let previous=session.previousTracks.at(-1),score=.82;if(!previous)return 1;
    if(track.artist===previous.artist)score+=.12;
    if(lower(track.genre)===lower(previous.genre))score+=.25;
    else {let a=lower(track.genre),b=lower(previous.genre),soft=[['lo-fi','hip-hop'],['chill','ambient'],['pop','dance'],['rock','alternative'],['house','electronic'],['rap','hip-hop']];score+=soft.some(pair=>pair.some(x=>a.includes(x))&&pair.some(x=>b.includes(x)))?.10:-.08}
    return clamp(score,.45,1.25);
  }
  function estimatedFeatures(track){
    let text=trackText(track),bpm=Number(track.bpm||track.tempo)||null,energy=Number(track.energy),valence=Number(track.valence);
    if(!Number.isFinite(energy)){energy=bpm?clamp((bpm-55)/100):/metal|hard|techno|dance|edm|rock|drum|party|trap/.test(text)?.82:/ambient|sleep|piano|acoustic|classical|lo-fi|chill/.test(text)?.24:.52}
    if(!Number.isFinite(valence))valence=/happy|party|upbeat|disco|pop/.test(text)?.82:/dark|sad|melanch|doom|death/.test(text)?.22:.55;
    return {text,bpm,energy,valence};
  }
  function moodScore(track,currentMood){
    let profile=C.moodProfiles[currentMood]||C.moodProfiles['Спокойствие'],f=estimatedFeatures(track),score=.62;
    if(profile.aliases.some(x=>f.text.includes(x)))score+=.48;
    if(profile.genres.some(x=>f.text.includes(x)))score+=.28;
    score+=.22*(1-Math.abs(f.energy-profile.energy));score+=.10*(1-Math.abs(f.valence-profile.valence));
    if(f.bpm)score+=.12*(1-clamp(Math.abs(f.bpm-profile.bpm)/100));
    return clamp(score,.32,1.42);
  }
  function userNoveltyScore(track,state){
    let stats=state.trackStats?.[idOf(track)];if(!stats)return 1;
    let playPenalty=clamp(Math.log2(1+(stats.plays||0))/5),recency=Math.exp(-daysSince(stats.lastPlayedAt)/12),week=(stats.recentPlayDates||[]).filter(x=>daysSince(x)<7).length;
    let liked=(state.likes||[]).some(x=>idOf(x)===idOf(track));return clamp(1-playPenalty*.52-recency*.34-clamp(week/5)*.28-(liked?.12:0));
  }
  function releaseNoveltyScore(track){let age=daysSince(track.releaseDate||track.release_date);if(age===9999)return .5;return clamp(1-Math.log10(1+age)/3.75)}
  function diversity(track,session){
    let recent=session.previousTracks.slice(-C.historyWindow),last=recent.at(-1),score=1,album=track.album||track.albumName;
    if(last?.artist===track.artist)score-=.42;if(album&&last?.album===album)score-=.25;
    let sameGenreTail=recent.slice(-4).filter(x=>lower(x.genre)===lower(track.genre)).length;if(sameGenreTail>=3)score-=.16*(sameGenreTail-2);
    return clamp(score,.22,1.08);
  }
  function penalties(track,session,state){
    let recent=session.previousTracks.slice(-C.historyWindow),id=idOf(track),sameIndex=[...recent].reverse().findIndex(x=>String(x.id)===id),artistCount=recent.slice(-6).filter(x=>x.artist===track.artist).length,album=track.album||track.albumName,albumCount=album?recent.slice(-8).filter(x=>x.album===album).length:0;
    let repeat=sameIndex===0?C.penalties.sameTrack:sameIndex>0&&sameIndex<C.recentTrackBlock?C.penalties.recentTrack*(1-sameIndex/C.recentTrackBlock):0;
    let artist=(recent.at(-1)?.artist===track.artist?C.penalties.sameArtist:0)+Math.max(0,artistCount-1)*C.penalties.recentArtist;
    let stats=state.trackStats?.[id]||{},explicitDislike=(state.dislikes||[]).includes(id),skip=clamp((stats.skips||0)*C.penalties.skip,0,.75)+((stats.dislikes||explicitDislike)?C.feedback.dislikeTrackPenalty:0),albumPenalty=albumCount*C.penalties.sameAlbum;
    return {repeatPenalty:repeat,artistRepeatPenalty:artist,skipPenalty:skip,albumPenalty};
  }
  function selectionType(track,state,selectedGenres){let stats=state.trackStats?.[idOf(track)]||{},liked=(state.likes||[]).some(x=>idOf(x)===idOf(track));if(liked||(stats.completed||0)>0||((stats.plays||0)>=2&&(stats.skips||0)<(stats.plays||0)))return'FAMILIAR';return tasteCompatibility(track,state,selectedGenres)>=.63?'DISCOVERY':'EXPERIMENT'}
  function mixWeight(type,n){let key=type.toLowerCase(),range=C.mix[key];return lerp(range.start,range.end,n)}
  function weightedFactor(score,weight,neutral=1){return Math.max(.08,1+(score-neutral)*weight)}
  function scoreTrack(track,context){
    let {state,session}=context,n=session.noveltyLevel,type=selectionType(track,state,context.selectedGenres),preference=preferenceScore(track,state,context.selectedGenres),similarity=similarityScore(track,session,state),mood=moodScore(track,session.currentMood),userNovelty=userNoveltyScore(track,state),releaseNovelty=releaseNoveltyScore(track),diversityScore=diversity(track,session),p=penalties(track,session,state);
    let noveltyScore=(1-n)*(1-userNovelty)+n*userNovelty,releaseFit=(1-n)*.5+n*releaseNovelty,discoveryScore=mixWeight(type,n),w=C.weights;
    let applied={preferenceWeight:w.preference,similarityWeight:w.similarity,moodWeight:w.mood,userNoveltyWeight:w.userNovelty,releaseNoveltyWeight:w.releaseNovelty,diversityWeight:w.diversity};
    let positive=weightedFactor(preference,w.preference)*weightedFactor(similarity,w.similarity)*weightedFactor(mood,w.mood)*weightedFactor(noveltyScore,w.userNovelty,.5)*weightedFactor(releaseFit,w.releaseNovelty,.5)*weightedFactor(diversityScore,w.diversity)*(.45+discoveryScore);
    let finalScore=positive-p.repeatPenalty-p.artistRepeatPenalty-p.skipPenalty-p.albumPenalty;
    return {track,finalScore,preferenceScore:preference,similarityScore:similarity,moodScore:mood,noveltyScore,discoveryScore,userNoveltyScore:userNovelty,releaseNoveltyScore:releaseNovelty,diversityScore,...applied,repeatPenalty:p.repeatPenalty,artistRepeatPenalty:p.artistRepeatPenalty,skipPenalty:p.skipPenalty,selectionType:type};
  }
  function getRankedCandidates(catalog,context,limit=15){
    return catalog.filter(Boolean).map(track=>scoreTrack(track,context)).sort((a,b)=>b.finalScore-a.finalScore).slice(0,Math.max(0,limit));
  }
  function isRecentlyPlayed(track,session,windowSize=C.hardTrackBlock){let id=idOf(track);return session.previousTracks.slice(-windowSize).some(previous=>String(previous.id)===id)}
  function eligibleCandidates(catalog,session){
    let source=catalog.filter(Boolean),stages=[[C.hardTrackBlock,10],[C.hardTrackBlockRelaxed,5],[C.hardTrackBlockMinimum,1]];
    for(let [windowSize,minimum] of stages){let candidates=source.filter(track=>!isRecentlyPlayed(track,session,windowSize));if(candidates.length>=minimum)return {candidates,windowSize,hardBlockedCount:source.length-candidates.length}}
    let windowSize=Math.min(3,session.previousTracks.length),candidates=source.filter(track=>!isRecentlyPlayed(track,session,windowSize));return {candidates,windowSize,hardBlockedCount:source.length-candidates.length};
  }
  function sampleCandidatesWithoutReplacement(scored,limit,random=Math.random){
    let remaining=scored.slice(),ordered=[];
    while(remaining.length&&ordered.length<limit){let floor=remaining.at(-1).finalScore,weights=remaining.map(x=>Math.exp((x.finalScore-floor)/C.temperature)),pick=random()*weights.reduce((a,b)=>a+b,0),chosenIndex=0;for(let i=0;i<remaining.length;i++){pick-=weights[i];if(pick<=0){chosenIndex=i;break}}ordered.push(remaining.splice(chosenIndex,1)[0])}
    return ordered;
  }
  function getWeightedCandidateOrder(catalog,context,limit=C.candidateTopK,random=Math.random){
    let eligible=eligibleCandidates(catalog,context.session),ranked=getRankedCandidates(eligible.candidates,context,C.candidateTopK),rankById=new Map(ranked.map((x,i)=>[idOf(x.track),i+1])),ordered=sampleCandidatesWithoutReplacement(ranked,Math.min(limit,ranked.length),random);
    return ordered.map((candidate,index)=>({...candidate,rankBeforeSampling:rankById.get(idOf(candidate.track)),sampledPosition:index+1,hardBlockedCount:eligible.hardBlockedCount,eligibleCandidateCount:eligible.candidates.length,candidatePoolSize:ranked.length,hardBlockWindow:eligible.windowSize}));
  }
  function getNextTrack(catalog,context,random=Math.random){
    let chosen=getWeightedCandidateOrder(catalog,context,1,random)[0];if(!chosen)return null;
    context.session.currentTrackId=idOf(chosen.track);if(!context.session.seedTrackId)context.session.seedTrackId=context.session.currentTrackId;
    return chosen;
  }
  global.WaveRecommendation={createSession,updateWavePreferences,recordEvent,moodScore,userNoveltyScore,releaseNoveltyScore,scoreTrack,isRecentlyPlayed,eligibleCandidates,sampleCandidatesWithoutReplacement,getWeightedCandidateOrder,getRankedCandidates,getNextTrack,idOf};
})(window);
