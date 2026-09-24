# SoundCloud API setup

SoundCloud adapter uses only the official SoundCloud API. It is disabled when no client ID is configured, while Audius and Internet Archive continue to work normally.

1. Obtain approved application credentials from the SoundCloud developer portal.
2. Use the official OAuth flow (or a secure server-side token broker) to obtain an access token. Current search and stream endpoints require OAuth authentication.
3. Before loading `source-config.js`, define `window.WAVE_SOUNDCLOUD_CLIENT_ID` and `window.WAVE_SOUNDCLOUD_ACCESS_TOKEN`. The adapter sends the token using `Authorization: OAuth ...`.
4. Redeploy and check `window.wavePlayerDebug().sources` plus `SEARCH_SOURCE_RESULT` messages in the browser console.

Because this is a static GitHub Pages application, browser-side credentials are visible. Never put the client secret in this repository or client-side JavaScript. A short-lived token delivered by a controlled backend is the safe production setup.
