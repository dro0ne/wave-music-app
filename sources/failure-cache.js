(function(root){
  // Transient failures expire; known missing/unsupported resources cool down
  // longer. A cancellation is never registered as a source failure.
  class FailureCache extends Set{
    constructor(){super();this.records=new Map()}
    add(id,error={}){const status=error.httpResult?.status||error.status||0,invalidType=[200,206].includes(status)&&error.httpResult?.contentType&&!error.httpResult.contentType.startsWith('audio/'),hard=[404,410,415].includes(status)||invalidType||error.code===4||error.name==='NotSupportedError',previous=this.records.get(id),attempts=(previous?.attempts||0)+1,ttl=hard?30*60*1000:Math.min(5*60*1000,30000*2**Math.min(attempts-1,4));this.records.set(id,{kind:hard?'hard':'temporary',status,attempts,expiresAt:Date.now()+ttl});super.add(id);return this}
    has(id){const record=this.records.get(id);if(record&&record.expiresAt<=Date.now()){super.delete(id);return false}return super.has(id)}
    prune(){for(const id of super.values())this.has(id);if(this.records.size>1000)for(const [id,r] of this.records)if(r.expiresAt<=Date.now())this.records.delete(id)}
    get size(){this.prune();return super.size}
    clear(){super.clear();this.records?.clear()}
    delete(id){this.records.delete(id);return super.delete(id)}
    summary(){this.prune();let hard=0,temporary=0;for(const id of super.values())this.records.get(id)?.kind==='hard'?hard++:temporary++;return {hard,temporary,temporaryBaseTtlMs:30000,temporaryMaxTtlMs:300000,hardTtlMs:1800000}}
  }
  root.WaveFailureCache=FailureCache;
})(typeof window!=='undefined'?window:globalThis);
