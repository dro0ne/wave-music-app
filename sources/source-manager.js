(function(root){
  class SourceManager{
    constructor(sources=Object.values(root.WaveSources||{}),config=root.WaveSourceConfig||{}){this.config=config;this.catalogPages=new Map();this.catalogCycles=[];this.catalogSequence=0;this.catalogFetchCount=0;this.pageTasks=0;this.pageWaiters=[];this.sources=new Map(sources.map(x=>[x.id,x]));this.metadataCache=new Map();this.streamCache=new Map();this.health=new Map(sources.map(x=>[x.id,{successCount:0,failureCount:0,averageResolveTime:0}]))}
    enabled(){return [...this.sources.values()].filter(x=>!x.enabled||x.enabled())}withTimeout(task,ms=this.config.REQUEST_TIMEOUT_MS||6000,parentSignal=null){let controller=new AbortController(),timer=setTimeout(()=>controller.abort('source timeout'),ms);let abort=()=>controller.abort(parentSignal?.reason);if(parentSignal?.aborted)abort();else parentSignal?.addEventListener('abort',abort,{once:true});return Promise.resolve().then(()=>task(controller.signal)).finally(()=>{clearTimeout(timer);parentSignal?.removeEventListener('abort',abort)})}mark(id,ok,ms){let h=this.health.get(id)||{successCount:0,failureCount:0,averageResolveTime:0},count=h.successCount+h.failureCount;ok?h.successCount++:h.failureCount++;h.averageResolveTime=Math.round((h.averageResolveTime*count+ms)/(count+1));this.health.set(id,h)}priority(id){let base=(this.config.SOURCE_PRIORITY||[]).indexOf(id),h=this.health.get(id)||{};return (base<0?99:base)+(h.failureCount||0)*2-(h.successCount||0)*.1}
    async call(source,method,...args){let started=performance.now();try{let value=await this.withTimeout(signal=>source[method](...args,{signal}));this.mark(source.id,true,performance.now()-started);return value}catch(error){this.mark(source.id,false,performance.now()-started);throw error}}
    deduplicate(tracks){
      const groups=[],identities=new Map(),metadata=new Map(),model=root.WaveTrackModel;
      for(const track of tracks.filter(Boolean)){
        const keys=model.sourceKeys(track).map(x=>'id:'+x);if(typeof track.streamUrl==='string'&&track.streamUrl)keys.push('url:'+track.streamUrl);
        const comparable=model.dedupeKey(track),bucket=metadata.get(comparable)||[];
        let group=keys.map(key=>identities.get(key)).find(Boolean)||bucket.find(x=>model.samePlaybackRecording(x.primary,track));
        if(!group){group={primary:track,all:[]};groups.push(group);bucket.push(group);metadata.set(comparable,bucket)}
        group.all=[...new Map([...group.all,track,...(track.alternatives||[])].map(x=>[model.sourceKey(x),x])).values()];group.all.sort((a,b)=>this.priority(a.source)-this.priority(b.source));group.primary=group.all[0];for(const key of keys)identities.set(key,group);
      }
      return groups.map(({primary,all})=>({...primary,recordingSourceKeys:[...new Set(all.flatMap(x=>model.sourceKeys(x)))],alternatives:all.filter(x=>x.id!==primary.id).map(x=>({...x,alternatives:[]}))}));
    }
    async aggregateBatch(method,args,onBatch){let key=`${method}:${JSON.stringify(args)}`,cached=this.metadataCache.get(key);if(cached&&cached.expiresAt>Date.now()){onBatch?.(cached.value);return cached.value}let settled=await Promise.allSettled(this.enabled().map(async source=>{const tracks=await this.call(source,method,...args);onBatch?.(tracks||[]);return tracks})),tracks=this.deduplicate(settled.filter(x=>x.status==='fulfilled').flatMap(x=>x.value||[]));this.metadataCache.set(key,{value:tracks,expiresAt:Date.now()+(this.config.METADATA_CACHE_TTL_MS||600000)});return tracks}
    aggregate(method,...args){return this.aggregateBatch(method,args,null)}
    buildSearchQueries(query){
      let exact=String(query||'').trim().replace(/\s+/g,' '),simple=exact.replace(/\b(?:ft|feat|featuring)\.?\s+[^[(\-–—]+/gi,' ').replace(/[([](?:official(?: audio| video)?|lyrics?|remix|remastered?)[^\])]*[\])]/gi,' ').replace(/\s+/g,' ').trim(),dictionary={мияги:'Miyagi',miyagi:'Miyagi',эдшпиль:'Endspiel',эндшпиль:'Endspiel',endspiel:'Endspiel'};
      let translit=exact.split(/\s+/).map(word=>dictionary[word.toLowerCase()]||word).join(' '),parts=simple.split(/\s+/),reversed=parts.length>2?`${parts.slice(-1)} ${parts.slice(0,-1).join(' ')}`:'';
      return [...new Set([exact,translit,simple,reversed].filter(Boolean))].slice(0,4);
    }
    async searchTracks(query){
      let queries=this.buildSearchQueries(query),sources=this.enabled(),settled=await Promise.allSettled(sources.map(async source=>{let attempts=await Promise.allSettled(queries.map(value=>this.call(source,'searchTracks',value))),tracks=this.deduplicate(attempts.filter(x=>x.status==='fulfilled').flatMap(x=>x.value||[]));console.log('SEARCH_SOURCE_RESULT',{source:source.label||source.id,count:tracks.length,queries});return tracks}));
      return this.deduplicate(settled.filter(x=>x.status==='fulfilled').flatMap(x=>x.value||[]));
    }
    async catalogPage(source,method,args,context){
      const key=JSON.stringify([source.id,method,args,context]);let page=this.catalogPages.get(key);
      if(!page){page={offset:0,exhausted:false,retryAt:0,inFlight:null};this.catalogPages.set(key,page);if(this.catalogPages.size>160){const oldest=[...this.catalogPages].find(([,value])=>!value.inFlight);if(oldest)this.catalogPages.delete(oldest[0])}}
      if(page.inFlight)return page.inFlight;if(page.exhausted||page.retryAt>Date.now())return {tracks:[],source:source.id,skipped:true};
      const offset=page.offset,limit=source.id==='archive'?8:40;
      const run=async()=>{
        if(this.pageTasks>=2)await new Promise(resolve=>this.pageWaiters.push(resolve));else this.pageTasks++;
        const started=performance.now();this.catalogFetchCount++;
        try{
          const tracks=await this.withTimeout(signal=>source[method](...args,{signal,limit,offset,page:Math.floor(offset/limit)+1}));this.mark(source.id,true,performance.now()-started);
          const stats=tracks.pipeline||{received:tracks.length,normalized:tracks.length};page.offset+=limit;page.exhausted=stats.received<limit||(source.id==='audius'&&method==='getTrendingTracks'&&page.offset>=100);
          return {source:source.id,method,offset,page:Math.floor(offset/limit)+1,limit,received:stats.received,normalized:stats.normalized,deduped:this.deduplicate(tracks).length,tracks};
        }catch(error){this.mark(source.id,false,performance.now()-started);if(error.status===400)page.exhausted=true;else page.retryAt=Date.now()+60000;return {source:source.id,method,offset,received:0,normalized:0,deduped:0,errorName:error.name,errorCode:error.status||0,tracks:[]}}
        finally{const waiter=this.pageWaiters.shift();if(waiter)waiter();else this.pageTasks--}
      };
      const task=run();page.inFlight=task;try{return await task}finally{if(page.inFlight===task)page.inFlight=null}
    }
    async getCatalog({genres=[],onBatch=null}={}){
      const context=genres.slice().sort().join('|'),sources=this.enabled(),methods=[...genres.slice(0,4).map(g=>['getTracksByGenre',[g]]),['getTrendingTracks',[]],['getLatestTracks',[]]],cycle={id:++this.catalogSequence,context,sources:{},pages:[]};
      this.catalogCycles.push(cycle);if(this.catalogCycles.length>20)this.catalogCycles.shift();
      const jobs=methods.flatMap(([method,args])=>sources.filter(source=>typeof source[method]==='function').map(async source=>{const result=await this.catalogPage(source,method,args,context);const {tracks,...safe}=result;cycle.pages.push(safe);let stats=cycle.sources[source.id]||{received:0,normalized:0,deduped:0,fetches:0};for(const field of ['received','normalized','deduped'])stats[field]+=result[field]||0;if(!result.skipped)stats.fetches++;cycle.sources[source.id]=stats;onBatch?.(tracks);return tracks}));
      const settled=await Promise.allSettled(jobs),tracks=this.deduplicate(settled.filter(x=>x.status==='fulfilled').flatMap(x=>x.value));cycle.finalCount=tracks.length;return tracks;
    }
    async resolveTrack(track,{signal}={}){let variants=[track,...(track.alternatives||[])].sort((a,b)=>this.priority(a.source)-this.priority(b.source)),errors=[];for(let variant of variants){let key=`${variant.source}:${variant.sourceTrackId}`,cached=this.streamCache.get(key);if(cached&&(!cached.expiresAt||cached.expiresAt-(this.config.STREAM_CACHE_SAFETY_MS||30000)>Date.now()))return {...track,activeSource:variant.source,streamUrl:cached.url,stream:cached.url};let source=this.sources.get(variant.source);if(!source)continue;try{let resolved=await this.withTimeout(inner=>source.getStream(variant,{signal:inner}),this.config.REQUEST_TIMEOUT_MS||6000,signal);this.streamCache.set(key,{...resolved,resolvedAt:Date.now()});return {...track,activeSource:variant.source,streamUrl:resolved.url,stream:resolved.url}}catch(error){if(signal?.aborted)throw error;errors.push({source:variant.source,error:error.message,status:error.status||0,errorName:error.name})}}throw Object.assign(Error('No playable source for track'),{causes:errors,status:errors.length&&errors.every(x=>[404,410,415].includes(x.status))?errors[0].status:0})}debug(){return {enabledSources:this.enabled().map(x=>x.id),catalogFetchCount:this.catalogFetchCount,catalogCycles:this.catalogCycles.slice(),pages:[...this.catalogPages].map(([key,value])=>({key,offset:value.offset,exhausted:value.exhausted,retryAt:value.retryAt})),priority:this.config.SOURCE_PRIORITY,health:Object.fromEntries(this.health),metadataCacheSize:this.metadataCache.size,streamCacheSize:this.streamCache.size}}
  }root.WaveSourceManager=SourceManager;
})(typeof window!=='undefined'?window:globalThis);
