(function(root){
  // A link pasted into search opens that track directly: YouTube and SoundCloud through their official players,
  // Spotify and Deezer through their APIs, Yandex Music in its own widget (it has no control API).
  const model=()=>root.WaveTrackModel;
  async function oembed(url,signal){const response=await fetch(url,{signal});if(!response.ok)throw Object.assign(Error(`oEmbed HTTP ${response.status}`),{status:response.status});return response.json()}
  const PATTERNS={
    youtube:/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i,
    soundcloud:/^https?:\/\/(?:www\.|m\.|on\.)?soundcloud\.com\/[^\s?#]+/i,
    yandex:/music\.yandex\.(?:ru|com|by|kz|uz)\/(?:album\/\d+\/)?track\/\d+/i,
    spotify:/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([A-Za-z0-9]{22})/i,
    deezer:/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i
  };
  const kind=text=>Object.keys(PATTERNS).find(name=>PATTERNS[name].test(text))||'';
  async function resolve(text,{signal}={}){
    const value=String(text||'').trim();if(!/^https?:\/\/|^(?:www\.|m\.)?(?:youtu|soundcloud|music\.yandex|open\.spotify|deezer)/i.test(value))return null;
    const found=kind(value);if(!found)return null;
    if(found==='yandex'){root.WaveEmbeds?.openYandex(value);return {message:'Открыли трек в плеере Яндекс Музыки — внизу справа'}}
    if(found==='youtube'){
      const id=value.match(PATTERNS.youtube)[1],info=await oembed(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v='+id)}`,signal).catch(()=>({}));
      const track=root.WaveSources.youtube?.normalizeTrack({id,title:info.title||'YouTube',channel:info.author_name||'',artwork:info.thumbnail_url||`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,duration:null});
      return {tracks:[track]};
    }
    if(found==='soundcloud'){
      const url=value.match(PATTERNS.soundcloud)[0],info=await oembed(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,signal);
      // The widget plays the canonical URL from oEmbed (short on.soundcloud.com links redirect to it).
      const canonical=(info.html||'').match(/url=([^&"]+)/)?.[1],playUrl=canonical?decodeURIComponent(canonical):url;
      const full=String(info.title||''),cut=full.lastIndexOf(' by '),title=cut>0?full.slice(0,cut):full,artist=cut>0?full.slice(cut+4):'';
      return {tracks:[{...model().normalizeTrack({sourceTrackId:playUrl,title:title||info.title,artist:artist||info.author_name,artwork:info.thumbnail_url,streamUrl:'soundcloud:'+playUrl,permalink:url},'soundcloud'),embedded:true}]};
    }
    if(found==='spotify'){
      if(!root.WaveSpotify?.connected())return {message:'Чтобы открыть ссылку Spotify, подключи Spotify в профиле'};
      const raw=await root.WaveSpotify.api(`/tracks/${value.match(PATTERNS.spotify)[1]}`,{signal});return {tracks:[root.WaveSources.spotify.normalizeTrack(raw)]};
    }
    if(found==='deezer'){
      const raw=await root.WaveSources.deezer.jsonp(`/track/${value.match(PATTERNS.deezer)[1]}`,signal);root.WaveSources.deezer.allowPreview(raw.id,raw.preview);return {tracks:[root.WaveSources.deezer.normalizeTrack(raw)]};
    }
    return null;
  }
  root.WaveLinks={resolve,kind,looksLikeLink:text=>!!kind(String(text||'').trim())};
})(typeof window!=='undefined'?window:globalThis);
