# SoundCloud API setup

SoundCloud adapter uses only the official SoundCloud API. It is disabled when no client ID is configured, while Audius and Internet Archive continue to work normally.

1. Obtain an approved application credential from the SoundCloud developer portal.
2. In `sources/source-config.js`, replace the empty fallback in `SOUNDCLOUD_CLIENT_ID` with the official client ID, or define `window.WAVE_SOUNDCLOUD_CLIENT_ID` before loading `source-config.js`.
3. Redeploy the static site and check `window.wavePlayerDebug().sources` plus `SEARCH_SOURCE_RESULT` messages in the browser console.

Because this is a static GitHub Pages application, any browser-side client ID is public. Do not put a client secret in this repository or in client-side JavaScript.
