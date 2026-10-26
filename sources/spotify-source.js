(function(root){
  // Spotify catalogue through the official Web API with the listener's own account: search, the wave's genres
  // (search with a genre: filter) and the listener's liked tracks as the familiar part of the wave.
  // Streams are spotify: URIs, played by WaveSpotifyPlayer.
  const PAGE=10;
  // The wave's genre labels mostly match Spotify's genre names in lower case; these are the exceptions.
  const GENRES={'Hip-Hop/Rap':'hip hop','R&B/Soul':'r&b','Russian Rap':'russian hip hop','Russian Hip-Hop':'russian hip hop','Russian':'russian pop','Lo-Fi':'lo-fi','Kids':"children's music",'Video Game Music':'video game music','Podcasts':null,'Spoken Word':null};
  const spotifyGenre=label=>label in GENRES?GENRES[label]:String(label||'').toLowerCase().replace(/\s*\/.*$/,'')||null;
  const normalize=(raw,genre=null)=>({...root.WaveTrackModel.normalizeTrack({sourceTrackId:raw.id,title:raw.name,artist:(raw.artists||[]).map(a=>a.name).join(', '),album:raw.album?.name,artwork:raw.album?.images?.[0]?.url||null,duration:raw.duration_ms/1000,releaseDate:raw.album?.release_date,genre,streamUrl:raw.uri,permalink:raw.external_urls?.spotify},'spotify'),isrc:raw.external_ids?.isrc||null,explicit:!!raw.explicit});
  const playable=raw=>raw&&raw.uri&&raw.is_playable!==false&&!raw.is_local;
  const finish=(items,genre)=>{const tracks=items.filter(playable).map(raw=>normalize(raw,genre));tracks.pipeline={received:items.length,normalized:tracks.length};return tracks};
  // Reads `limit` results from `offset` in pages Spotify accepts, stopping early when a page comes back short.
  async function pages(path,pick,{signal,limit,offset,size=PAGE}){
    const items=[];
    for(let at=offset;at<offset+limit;at+=size){
      const data=await root.WaveSpotify.api(`${path}${path.includes('?')?'&':'?'}limit=${Math.min(size,offset+limit-at)}&offset=${at}`,{signal}),page=pick(data)||[];
      items.push(...page);if(page.length<Math.min(size,offset+limit-at))break;
    }
    return items;
  }
  root.WaveSources=root.WaveSources||{};root.WaveSources.spotify={id:'spotify',label:'Spotify',enabled:()=>!!root.WaveSpotifyPlayer?.usable(),
    async searchTracks(text,{signal,limit=PAGE}={}){
      const data=await root.WaveSpotify.api(`/search?type=track&limit=${limit}&q=${encodeURIComponent(text)}`,{signal});
      return finish(data?.tracks?.items||[],null);
    },
    async getTracksByGenre(label,{signal,limit=40,offset=0}={}){
      const genre=spotifyGenre(label);if(!genre){const none=[];none.pipeline={received:0,normalized:0};return none}
      return finish(await pages(`/search?type=track&q=${encodeURIComponent(`genre:"${genre}"`)}`,data=>data?.tracks?.items,{signal,limit,offset}),label);
    },
    // The listener's liked songs on Spotify: the familiar side of the wave.
    async getTrendingTracks({signal,limit=40,offset=0}={}){
      return finish((await pages('/me/tracks',data=>data?.items,{signal,limit,offset,size:50})).map(item=>item?.track),null);
    },
    async getStream(track){if(!root.WaveSpotifyPlayer?.isUri(track.streamUrl))throw Error('Spotify URI missing');return {url:track.streamUrl}},
    normalizeTrack:normalize,spotifyGenre};
})(typeof window!=='undefined'?window:globalThis);
