const results=[];function test(name,fn){try{fn();results.push(`PASS ${name}`)}catch(error){results.push(`FAIL ${name}: ${error.message}`)}}function assert(v,m){if(!v)throw Error(m)}
const genre=(value,tags=[])=>WaveGenre.normalizeGenre(value,tags),track=(genreValue,extra={})=>WaveTrackModel.normalizeTrack({id:genreValue,title:'Track',artist:'Artist',genre:genreValue,...extra},'test');
test('Russian Rap maps to hiphop/russian',()=>{let x=genre('Russian Rap');assert(x.normalizedGenre==='hiphop'&&x.subgenres.includes('russian'),'bad mapping')});
test('Trap maps to hiphop/trap',()=>{let x=genre('Trap');assert(x.normalizedGenre==='hiphop'&&x.subgenres.includes('trap'),'bad mapping')});
test('Hard Rock maps to rock/hard-rock',()=>{let x=genre('Hard Rock');assert(x.normalizedGenre==='rock'&&x.subgenres.includes('hard-rock'),'bad mapping')});
test('Deep House maps to electronic/house/deep-house',()=>{let x=genre('Deep House');assert(x.normalizedGenre==='electronic'&&x.subgenres.includes('house')&&x.subgenres.includes('deep-house'),'bad mapping')});
test('unknown genre is safe',()=>assert(genre('').normalizedGenre==='unknown','missing unknown'));
test('explicit metadata has full confidence',()=>assert(genre('Jazz').genreConfidence===1,'wrong confidence'));
test('tags have medium confidence',()=>assert(genre(null,['ambient']).genreConfidence===.8,'wrong tag confidence'));
test('Energy boosts energetic family',()=>assert(WaveMood.score(track('EDM'),'Энергия',{}).score>WaveMood.score(track('Ambient'),'Энергия',{}).score,'energy direction failed'));
test('Calm lowers aggressive candidates',()=>assert(WaveMood.score(track('Ambient'),'Спокойствие',{}).score>WaveMood.score(track('Death Metal'),'Спокойствие',{}).score,'calm direction failed'));
test('Focus prefers instrumental',()=>assert(WaveMood.score(track('Instrumental'),'Фокус',{}).score>WaveMood.score(track('Dance'),'Фокус',{}).score,'focus failed'));
test('positive signals increase mood direction',()=>{let state={},t=track('Hard Rock'),before=WaveMood.score(t,'Энергия',state).score;WaveMood.record(state,'Энергия',t,'ended',1);WaveMood.record(state,'Энергия',t,'ended',1);assert(WaveMood.score(t,'Энергия',state).score>before,'affinity did not grow')});
test('skip streak changes intent not global taste',()=>{let state={taste:{genres:{rock:5}}},t=track('Hard Rock');for(let i=0;i<3;i++)WaveMood.record(state,'Энергия',t,'skip',.05);assert(state.moodSkipStreak.count===3&&state.taste.genres.rock===5,'global taste changed')});
let failed=results.filter(x=>x.startsWith('FAIL')).length;document.querySelector('#results').textContent=`${failed?'FAILED':'PASSED'}\n${results.join('\n')}`;document.body.dataset.failed=String(failed);
