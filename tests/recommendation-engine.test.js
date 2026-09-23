const results=[];
function test(name,fn){try{fn();results.push(`PASS ${name}`)}catch(error){results.push(`FAIL ${name}: ${error.message}`)}}
function assert(condition,message){if(!condition)throw Error(message)}
const tracks={
  calmFamiliar:{id:'calm-old',title:'Old Calm',artist:'Soft A',genre:'Lo-Fi',mood:'Peaceful',bpm:72,releaseDate:'2018-01-01'},
  calmNew:{id:'calm-new',title:'New Calm',artist:'Soft B',genre:'Ambient',mood:'Chill',bpm:68,releaseDate:'2026-08-01'},
  energyFamiliar:{id:'energy-old',title:'Old Energy',artist:'Fast A',genre:'Dance',mood:'Energizing',bpm:130,releaseDate:'2019-01-01'},
  energyNew:{id:'energy-new',title:'New Energy',artist:'Fast B',genre:'Electronic',mood:'Upbeat',bpm:128,releaseDate:'2026-08-15'},
  experiment:{id:'wild',title:'Wild',artist:'Other',genre:'Death Metal',mood:'Aggressive',bpm:190,releaseDate:'2026-09-01'}
};
function fixture(){return {likes:[tracks.calmFamiliar,tracks.energyFamiliar],taste:{genres:{'Lo-Fi':3,Dance:3},artists:{'Soft A':3,'Fast A':3}},trackStats:{'calm-old':{plays:8,completed:7,skips:0,likes:1,dislikes:0,lastPlayedAt:'2026-07-01',recentPlayDates:[]},'energy-old':{plays:7,completed:6,skips:0,likes:1,dislikes:0,lastPlayedAt:'2026-07-01',recentPlayDates:[]}}}}
function score(track,mood,novelty,state=fixture(),previousTracks=[]){let session=WaveRecommendation.createSession({currentMood:mood,noveltyLevel:novelty,previousTracks});return WaveRecommendation.scoreTrack(track,{state,session,selectedGenres:['Lo-Fi','Ambient','Dance','Electronic']})}
test('1 calm + novelty 0 prefers familiar calm',()=>assert(score(tracks.calmFamiliar,'Спокойствие',0).finalScore>score(tracks.calmNew,'Спокойствие',0).finalScore,'new calm outranked familiar'));
test('2 calm + novelty 1 prefers new calm',()=>assert(score(tracks.calmNew,'Спокойствие',1).finalScore>score(tracks.calmFamiliar,'Спокойствие',1).finalScore,'familiar calm outranked new'));
test('3 energetic + novelty 0 prefers familiar energetic',()=>assert(score(tracks.energyFamiliar,'Энергия',0).finalScore>score(tracks.energyNew,'Энергия',0).finalScore,'new energy outranked familiar'));
test('4 energetic + novelty 1 prefers new energetic',()=>assert(score(tracks.energyNew,'Энергия',1).finalScore>score(tracks.energyFamiliar,'Энергия',1).finalScore,'familiar energy outranked new'));
test('mood is soft, not a hard filter',()=>assert(score(tracks.experiment,'Спокойствие',1).moodScore>0,'mismatched mood was excluded'));
test('5 repeated early skips lower future score',()=>{let state=fixture(),session=WaveRecommendation.createSession({currentMood:'Спокойствие',noveltyLevel:.5});let before=WaveRecommendation.scoreTrack(tracks.calmNew,{state,session,selectedGenres:['Ambient']});for(let i=0;i<3;i++)WaveRecommendation.recordEvent(state,session,tracks.calmNew,'skip',.05);let after=WaveRecommendation.scoreTrack(tracks.calmNew,{state,session,selectedGenres:['Ambient']});assert(after.skipPenalty>before.skipPenalty&&after.finalScore<before.finalScore,'skip signal did not lower score')});
test('6 like raises preference for future selection',()=>{let state=fixture(),session=WaveRecommendation.createSession({currentMood:'Спокойствие',noveltyLevel:.5}),context={state,session,selectedGenres:[]};let before=WaveRecommendation.scoreTrack(tracks.calmNew,context);state.likes.push(tracks.calmNew);WaveRecommendation.recordEvent(state,session,tracks.calmNew,'like',.4);let after=WaveRecommendation.scoreTrack(tracks.calmNew,context);assert(after.preferenceScore>before.preferenceScore,'like did not raise preference')});
test('7 recently played favorite receives repeat penalty',()=>{let previous=[{id:'calm-old',artist:'Soft A',album:'',genre:'Lo-Fi',playedAt:new Date().toISOString()}],recent=score(tracks.calmFamiliar,'Спокойствие',0,fixture(),previous),alternative=score(tracks.calmNew,'Спокойствие',0,fixture(),previous);assert(recent.repeatPenalty>0&&recent.finalScore<alternative.finalScore,'favorite repeated immediately')});
let failed=results.filter(x=>x.startsWith('FAIL')).length;document.querySelector('#results').textContent=`${failed?'FAILED':'PASSED'}\n${results.join('\n')}`;document.body.dataset.failed=String(failed);
