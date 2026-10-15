(function(root){
  // The server's own Creative Commons library (server/library.py). Present only on our server: it is enabled
  // when api/health reports tracks, and its audio comes from the same origin, so it plays even when others fail.
  const API='api/library/tracks';
  const LICENSE_URL={'CC0':'https://creativecommons.org/publicdomain/zero/1.0/','Public Domain':'https://creativecommons.org/publicdomain/mark/1.0/'};
  const licenseUrl=name=>{if(LICENSE_URL[name])return LICENSE_URL[name];let m=/^CC ([A-Z-]+) ([\d.]+)$/.exec(name||'');return m?`https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/`:null};
  const normalize=raw=>root.WaveTrackModel.normalizeTrack({sourceTrackId:raw.id,title:raw.title,artist:raw.artist,album:raw.album,genre:null,tags:raw.tags,duration:raw.duration,plays:raw.downloads,artwork:raw.artwork,streamUrl:raw.stream,permalink:raw.permalink,license:raw.license,licenseUrl:licenseUrl(raw.license)},'library');
  // Archive tags rarely name moods, so a mood without genres searches the genres that fit it.
  const moodTerms=mood=>root.WAVE_RECOMMENDATION_CONFIG?.moodProfiles?.[mood]?.genres||[];
  async function query(params,signal){let url=`${API}?${new URLSearchParams(params)}`,response=await fetch(url,{signal});if(!response.ok)throw Error(`Library HTTP ${response.status}`);let data=(await response.json()).data||[],tracks=data.map(normalize);tracks.pipeline={received:data.length,normalized:tracks.length};return tracks}
  root.WaveSources=root.WaveSources||{};root.WaveSources.library={id:'library',label:'Волна',enabled:()=>!!root.WaveProxy?.library,
    searchTracks(text,{signal,limit=24,offset=0}={}){return query({terms:text,limit,offset},signal)},
    getTracksByGenre(label,{signal,limit=50,offset=0}={}){return query({terms:label,limit,offset},signal)},
    getTracksByMood(mood,label,{signal,limit=50,offset=0}={}){return query({terms:label||moodTerms(mood).join('|'),limit,offset},signal)},
    getTrendingTracks({signal,limit=100,offset=0}={}){return query({sort:'popular',limit,offset},signal)},
    getLatestTracks({signal,limit=100,offset=0}={}){return query({sort:'new',limit,offset},signal)},
    async getStream(track){if(!track.streamUrl)throw Error('Library stream URL missing');return {url:track.streamUrl}},normalizeTrack:normalize};
})(typeof window!=='undefined'?window:globalThis);
