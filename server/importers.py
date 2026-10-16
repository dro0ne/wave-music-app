"""Playlist import for «Волна»: reads only the track list of a public playlist, never the audio.

Given a link to a public playlist (Yandex Music, Deezer, Apple Music) or a pasted list / CSV export,
returns artist, title, a readable genre and year for each track. The site turns that into a starting taste
profile, so the wave knows what someone likes before they press play. The server only ever requests the
services' own API addresses built from the ids in the link, never an arbitrary address from the request.
Standard library only.
"""
import csv
import io
from concurrent.futures import ThreadPoolExecutor
import json
import re
import urllib.error
import urllib.parse
import urllib.request

USER_AGENT = 'Mozilla/5.0 (wave-music-import; personal non-commercial player)'
TIMEOUT = 20
MAX_TRACKS = 10000
MAX_RESPONSE = 48 * 1024 * 1024
DEEZER_GENRE_ALBUMS = 40


class PlaylistImportError(Exception):
    def __init__(self, status, code, message):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message


def fetch(url, accept_json=True, language='ru,en;q=0.8'):
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept-Language': language})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        body = response.read(MAX_RESPONSE + 1)
        if len(body) > MAX_RESPONSE:
            raise PlaylistImportError(413, 'too_big', 'Плейлист слишком большой')
        return (json.loads(body) if accept_json else body.decode('utf-8', 'replace')), response.geturl()


# Yandex genre ids → words the site's genre matcher understands ("rusrap" → "russian rap").
YANDEX_GENRES = {
    'rusrap': 'russian rap', 'foreignrap': 'rap', 'rap': 'rap', 'phonkgenre': 'phonk', 'electronics': 'electronic',
    'edmgenre': 'edm', 'dance': 'dance', 'ruspop': 'russian pop', 'pop': 'pop', 'rusrock': 'russian rock', 'rock': 'rock',
    'alternative': 'alternative', 'metalcoregenre': 'metalcore', 'metal': 'metal', 'alternativemetal': 'alternative metal',
    'deathmetal': 'death metal', 'epicmetal': 'symphonic metal', 'folkmetal': 'folk metal', 'numetal': 'nu metal',
    'blackmetal': 'black metal', 'thrashmetal': 'thrash metal', 'progmetal': 'progressive metal', 'hardrock': 'hard rock',
    'punk': 'punk', 'postpunk': 'post-punk', 'folk': 'folk', 'folkrock': 'folk rock', 'rusfolk': 'russian folk',
    'soundtrack': 'soundtrack', 'videogame': 'video game soundtrack', 'films': 'soundtrack', 'local-indie': 'indie',
    'indie': 'indie', 'rusestrada': 'russian pop', 'estrada': 'pop', 'jazz': 'jazz', 'classical': 'classical',
    'classicalmusic': 'classical', 'rnb': 'rnb', 'soul': 'soul', 'funk': 'funk', 'reggae': 'reggae', 'ambient': 'ambient',
    'newage': 'ambient', 'relax': 'chill', 'lounge': 'lounge', 'house': 'house', 'techno': 'techno', 'trance': 'trance',
    'dnb': 'drum and bass', 'dubstep': 'dubstep', 'experimental': 'experimental', 'industrial': 'industrial',
    'postrock': 'post-rock', 'blues': 'blues', 'country': 'country', 'latinfolk': 'latin', 'latin': 'latin',
    'kpop': 'k-pop', 'jpop': 'j-pop', 'anime': 'j-pop', 'shanson': 'chanson', 'bard': 'singer-songwriter',
    'children': 'kids', 'hardcore': 'hardcore', 'disco': 'disco', 'hyperpopgenre': 'hyperpop', 'lofi': 'lo-fi',
}


def yandex_genre(code):
    code = (code or '').strip().lower()
    if not code:
        return ''
    return YANDEX_GENRES.get(code) or re.sub(r'genre$', '', code).replace('-', ' ')


def yandex_track(raw):
    track = raw.get('track') or raw
    album = (track.get('albums') or [{}])[0]
    return {'artists': [a.get('name') for a in track.get('artists') or [] if a.get('name')], 'title': track.get('title') or '',
            'genre': yandex_genre(album.get('genre')), 'year': album.get('year'), 'album': album.get('title') or ''}


def import_yandex(parts, query):
    host = 'https://api.music.yandex.net'
    path = parts.path.rstrip('/')
    if m := re.search(r'/playlists/(lk\.[0-9a-f-]{36})$', path):
        api = f'{host}/playlist/{m.group(1)}'
    elif m := re.search(r'/users/([\w.@+-]{1,64})/playlists/(\d{1,12})$', path):
        api = f'{host}/users/{urllib.parse.quote(m.group(1))}/playlists/{m.group(2)}'
    elif m := re.search(r'/album/(\d{1,12})(?:/track/\d+)?$', path):
        data, _ = fetch(f'{host}/albums/{m.group(1)}/with-tracks')
        album = data.get('result') or {}
        tracks = [t for volume in album.get('volumes') or [] for t in volume]
        for t in tracks:
            t.setdefault('albums', [album])
        return {'service': 'yandex', 'title': album.get('title') or 'Альбом', 'tracks': [yandex_track(t) for t in tracks]}
    else:
        raise PlaylistImportError(400, 'bad_link', 'Нужна ссылка на плейлист или альбом Яндекс Музыки')
    data, _ = fetch(api)
    playlist = data.get('result') or {}
    if playlist.get('available') is False or playlist.get('visibility') == 'private':
        raise PlaylistImportError(403, 'private', 'Плейлист закрыт — сделай его публичным в Яндекс Музыке')
    return {'service': 'yandex', 'title': playlist.get('title') or 'Плейлист', 'tracks': [yandex_track(t) for t in playlist.get('tracks') or []]}


def import_deezer(parts, query, fetch_album_genres=True):
    host = 'https://api.deezer.com'
    if parts.netloc in ('link.deezer.com', 'deezer.page.link'):
        # Short share links only redirect to the real page; follow them and parse where they land.
        _, landed = fetch(urllib.parse.urlunsplit(('https', parts.netloc, parts.path, '', '')), accept_json=False)
        target = urllib.parse.urlsplit(landed)
        if not target.netloc.endswith('deezer.com') or target.netloc in ('link.deezer.com',):
            raise PlaylistImportError(400, 'bad_link', 'Не получилось открыть короткую ссылку Deezer')
        return import_deezer(target, target.query, fetch_album_genres)
    m = re.search(r'/(playlist|album)/(\d{1,15})', parts.path)
    if not m:
        raise PlaylistImportError(400, 'bad_link', 'Нужна ссылка на плейлист или альбом Deezer')
    kind, ident = m.groups()
    head, _ = fetch(f'{host}/{kind}/{ident}', language='en')
    if head.get('error'):
        raise PlaylistImportError(404, 'not_found', 'Deezer не отдал этот плейлист — он точно публичный?')
    raw, url = [], f'{host}/{kind}/{ident}/tracks?limit=100'
    while url and len(raw) < MAX_TRACKS:
        page, _ = fetch(url)
        raw += page.get('data') or []
        url = page.get('next') if str(page.get('next', '')).startswith(host + '/') else None
    album_genres = {}
    if kind == 'album':
        album_genres[int(ident)] = [g.get('name') for g in (head.get('genres') or {}).get('data') or []]
    elif fetch_album_genres:
        # Tracks carry no genre; the album does. Ask for the albums that appear most, staying under Deezer's rate limit.
        counts = {}
        for t in raw:
            album_id = (t.get('album') or {}).get('id')
            if album_id:
                counts[album_id] = counts.get(album_id, 0) + 1
        # English names, so the site's genre matcher reads them; a few at a time keeps under 50 requests per 5 s.
        def genres_of(album_id):
            try:
                album, _ = fetch(f'{host}/album/{int(album_id)}', language='en')
                return album_id, [g.get('name') for g in (album.get('genres') or {}).get('data') or []]
            except Exception:
                return album_id, []
        with ThreadPoolExecutor(6) as pool:
            album_genres.update(pool.map(genres_of, sorted(counts, key=counts.get, reverse=True)[:DEEZER_GENRE_ALBUMS]))
    tracks = []
    for t in raw:
        album = t.get('album') or {}
        album_id = album.get('id') if kind != 'album' else int(ident)
        tracks.append({'artists': [(t.get('artist') or {}).get('name')] if (t.get('artist') or {}).get('name') else [],
                       'title': t.get('title_short') or t.get('title') or '', 'genre': ', '.join(filter(None, album_genres.get(album_id, []))).lower(),
                       'year': None, 'album': album.get('title') or head.get('title') or ''})
    return {'service': 'deezer', 'title': head.get('title') or 'Плейлист', 'tracks': tracks}


def import_apple(parts, query):
    m = re.match(r'^/([a-z]{2})/(playlist|album)/([^/]{0,200})/((?:pl\.)?[\w.-]{1,80})$', parts.path.rstrip('/'))
    if not m:
        raise PlaylistImportError(400, 'bad_link', 'Нужна ссылка на плейлист или альбом Apple Music')
    country, kind, slug, ident = m.groups()
    page, _ = fetch(f'https://music.apple.com/{country}/{kind}/{urllib.parse.quote(slug)}/{ident}', accept_json=False)
    found = re.search(r'<script[^>]*id="serialized-server-data"[^>]*>(.*?)</script>', page, re.S)
    if not found:
        raise PlaylistImportError(502, 'unreadable', 'Apple Music не отдал список треков')
    songs = []

    def walk(node):
        if isinstance(node, dict):
            if 'artistName' in node and 'title' in node and isinstance(node.get('title'), str):
                songs.append(node)
                return
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)
    walk(json.loads(found.group(1)))
    title = re.search(r'<title>\W*(.*?)\s+-\s+(?:Playlist|Album|Плейлист|Альбом)', page)
    tracks = [{'artists': split_artists(s['artistName']), 'title': s['title'], 'genre': '', 'year': None, 'album': ''} for s in songs]
    return {'service': 'apple', 'title': title.group(1) if title else 'Плейлист', 'tracks': tracks, 'partial': True}


SERVICES = [
    (('music.yandex.ru', 'music.yandex.com', 'music.yandex.by', 'music.yandex.kz', 'music.yandex.uz'), import_yandex),
    (('www.deezer.com', 'deezer.com', 'link.deezer.com', 'deezer.page.link'), import_deezer),
    (('music.apple.com',), import_apple),
]
UNSUPPORTED = {
    'open.spotify.com': 'Spotify не отвечает серверу из России. Выгрузи плейлист в CSV через exportify.app и вставь файл или текст',
    'music.youtube.com': 'YouTube заблокирован для сервера. Скопируй список треков и вставь его текстом',
    'www.youtube.com': 'YouTube заблокирован для сервера. Скопируй список треков и вставь его текстом',
    'soundcloud.com': 'SoundCloud заблокирован для сервера. Скопируй список треков и вставь его текстом',
    'vk.com': 'VK отдаёт музыку только после входа. Скопируй список треков и вставь его текстом',
    'zvuk.com': 'Звук закрыт капчей для сервера. Скопируй список треков и вставь его текстом',
}


def import_url(url):
    url = (url or '').strip()
    if len(url) > 1000:
        raise PlaylistImportError(400, 'bad_link', 'Слишком длинная ссылка')
    parts = urllib.parse.urlsplit(url if '://' in url else 'https://' + url)
    host = parts.netloc.lower().split(':')[0]
    if parts.scheme not in ('http', 'https'):
        raise PlaylistImportError(400, 'bad_link', 'Нужна ссылка на плейлист')
    for hosts, importer in SERVICES:
        if host in hosts:
            parts = parts._replace(netloc=host)
            try:
                result = importer(parts, parts.query)
            except PlaylistImportError:
                raise
            except urllib.error.HTTPError as error:
                if error.code in (401, 403, 404):
                    raise PlaylistImportError(404, 'not_found', 'Плейлист не найден или закрыт — сделай его публичным')
                raise PlaylistImportError(502, 'upstream', 'Сервис сейчас не отвечает, попробуй позже')
            except (urllib.error.URLError, TimeoutError, ValueError):
                raise PlaylistImportError(502, 'upstream', 'Сервис сейчас не отвечает, попробуй позже')
            return finish(result)
    message = UNSUPPORTED.get(host) or UNSUPPORTED.get(host.removeprefix('m.'))
    raise PlaylistImportError(400, 'unsupported', message or 'Этот сервис пока не поддерживается. Вставь список треков текстом')


def split_artists(text):
    parts = re.split(r'\s*(?:,|&|\bfeat\.?|\bft\.?|\bx\b|;)\s*', text or '', flags=re.I)
    return [p.strip() for p in parts if p.strip()][:6]


LINE = re.compile(r'^\s*(?:\d{1,5}[.)]\s*)?(?P<artist>.+?)\s+[-–—]\s+(?P<title>.+?)\s*(?:\(?\d{1,2}:\d{2}(?::\d{2})?\)?)?\s*$')


def parse_text(text):
    """A pasted list ("Artist - Title" per line) or a CSV export (Exportify, TuneMyMusic, Soundiiz)."""
    text = (text or '').lstrip('﻿')
    if len(text) > 4 * 1024 * 1024:
        raise PlaylistImportError(413, 'too_big', 'Слишком длинный список')
    first = text.split('\n', 1)[0].lower()
    if re.search(r'artist|исполнитель', first) and re.search(r'track|title|song|name|назван|трек', first) and re.search(r'[,;\t]', first):
        dialect = csv.Sniffer().sniff(first, delimiters=',;\t')
        rows = list(csv.DictReader(io.StringIO(text), dialect=dialect))
        pick = lambda row, *keys: next((row[k] for k in row if k and any(x in k.lower() for x in keys) and row[k]), '')
        tracks = []
        for row in rows:
            artist = pick(row, 'artist name', 'artist', 'исполнитель')
            title = pick(row, 'track name', 'title', 'song', 'назван', 'трек') or pick(row, 'name')
            if artist and title:
                year = re.match(r'\d{4}', pick(row, 'release date', 'year', 'год'))
                tracks.append({'artists': split_artists(artist), 'title': title.strip(), 'genre': pick(row, 'genre', 'жанр').lower(),
                               'year': int(year.group()) if year else None, 'album': pick(row, 'album', 'альбом')})
        return finish({'service': 'csv', 'title': 'Импорт из файла', 'tracks': tracks})
    tracks = []
    for line in text.splitlines():
        m = LINE.match(line)
        if m and len(m['artist']) <= 200 and len(m['title']) <= 300:
            tracks.append({'artists': split_artists(m['artist']), 'title': m['title'], 'genre': '', 'year': None, 'album': ''})
    return finish({'service': 'text', 'title': 'Импорт списком', 'tracks': tracks})


def finish(result):
    tracks = [t for t in result['tracks'] if t['artists'] and t['title']][:MAX_TRACKS]
    if not tracks:
        raise PlaylistImportError(422, 'empty', 'Не нашёл ни одного трека. Для текста нужен формат «Исполнитель - Название» в каждой строке')
    artists, genres = {}, {}
    for t in tracks:
        for a in t['artists']:
            artists[a] = artists.get(a, 0) + 1
        if t['genre']:
            genres[t['genre']] = genres.get(t['genre'], 0) + 1
    top = lambda counts, n: [[k, v] for k, v in sorted(counts.items(), key=lambda kv: -kv[1])[:n]]
    return {'service': result['service'], 'title': result['title'], 'count': len(tracks), 'partial': bool(result.get('partial')),
            'topArtists': top(artists, 300), 'topGenres': top(genres, 60), 'tracks': tracks}
