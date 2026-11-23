(function(root){
  root.WaveSourceConfig={
    SOURCE_PRIORITY:['library','audius','spotify','youtube','soundcloud','deezer','jamendo','archive'],REQUEST_TIMEOUT_MS:6000,METADATA_CACHE_TTL_MS:10*60*1000,STREAM_CACHE_SAFETY_MS:30*1000,
    // Official SoundCloud API credential. Set window.WAVE_SOUNDCLOUD_CLIENT_ID before this script,
    // or replace the empty string below. Without it SoundCloud stays disabled and other sources continue working.
    SOUNDCLOUD_CLIENT_ID:root.WAVE_SOUNDCLOUD_CLIENT_ID||'',
    SOUNDCLOUD_ACCESS_TOKEN:root.WAVE_SOUNDCLOUD_ACCESS_TOKEN||'',
    JAMENDO_CLIENT_ID:root.WAVE_JAMENDO_CLIENT_ID||'',
    // YouTube Data API key for search; the listener can also enter their own in the profile.
    YOUTUBE_API_KEY:root.WAVE_YOUTUBE_API_KEY||''
  };
})(typeof window!=='undefined'?window:globalThis);
