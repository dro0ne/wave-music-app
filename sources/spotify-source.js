(function(root){
  // Spotify catalogue through the official Web API with the listener's own account. Only search for now: the wave
  // keeps building from the open catalogues. Streams are spotify: URIs, played by WaveSpotifyPlayer.
  const normalize=raw=>({...root.WaveTrackModel.normalizeTrack({sourceTrackId:raw.id,title:raw.name,artist:(raw.artists||[]).map(a=>a.name).join(', '),album:raw.album?.name,artwork:raw.album?.images?.[0]?.url||null,duration:raw.duration_ms/1000,releaseDate:raw.album?.release_date,streamUrl:raw.uri,permalink:raw.external_urls?.spotify},'spotify'),isrc:raw.external_ids?.isrc||null,explicit:!!raw.explicit});
  root.WaveSources=root.WaveSources||{};root.WaveSources.spotify={id:'spotify',label:'Spotify',enabled:()=>!!root.WaveSpotifyPlayer?.usable(),
    async searchTracks(text,{signal,limit=10}={}){
      const data=await root.WaveSpotify.api(`/search?type=track&limit=${limit}&q=${encodeURIComponent(text)}`,{signal});
      const items=(data?.tracks?.items||[]).filter(x=>x&&x.is_playable!==false),tracks=items.map(normalize);tracks.pipeline={received:items.length,normalized:tracks.length};return tracks;
    },
    async getStream(track){if(!root.WaveSpotifyPlayer?.isUri(track.streamUrl))throw Error('Spotify URI missing');return {url:track.streamUrl}},
    normalizeTrack:normalize};
})(typeof window!=='undefined'?window:globalThis);
