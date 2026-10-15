"""Music library harvester for «Волна».

Fills the server's own music store with Creative Commons tracks from Internet Archive netlabels:
for each genre seed it walks the most downloaded albums, keeps a few songs of song length from each,
saves the mp3 under MUSIC_DIR/files and records title, artist, tags, licence and source page in SQLite.
api.py serves the catalog from that database and nginx serves the files. Runs slowly and forever,
one album at a time, and stops downloading at the size quota. Standard library only.
"""
import json
import os
import re
import sqlite3
import sys
import time
import urllib.parse
import urllib.request

MUSIC_DIR = os.environ.get('MUSIC_DIR', '/music')
FILES_DIR = os.path.join(MUSIC_DIR, 'files')
LIB_DB = os.environ.get('LIB_DB', os.path.join(MUSIC_DIR, 'library.db'))
QUOTA_BYTES = int(float(os.environ.get('QUOTA_GB', '30')) * 1024 ** 3)
TRACKS_PER_ALBUM = int(os.environ.get('TRACKS_PER_ALBUM', '3'))
ALBUMS_PER_SEED_ROUND = int(os.environ.get('ALBUMS_PER_SEED_ROUND', '6'))
PAUSE = float(os.environ.get('PAUSE_SECONDS', '2'))
ROUND_SLEEP = float(os.environ.get('ROUND_SLEEP_SECONDS', str(6 * 3600)))
USER_AGENT = 'wave-music-library/1.0 (personal non-commercial player)'
MIN_SECONDS, MAX_SECONDS, MAX_FILE = 90, 12 * 60, 30 * 1024 ** 2

# Archive subjects to search for, roughly one per family the site offers.
SEEDS = ['electronic', 'ambient', 'techno', 'house', 'idm', 'downtempo', 'chillout', 'lofi', 'hip hop', 'trip hop',
         'rock', 'indie', 'post-rock', 'punk', 'metal', 'pop', 'synthpop', 'folk', 'acoustic', 'jazz', 'blues',
         'classical', 'piano', 'soundtrack', 'experimental', 'chiptune', 'dubstep', 'drum and bass', 'reggae',
         'world', 'latin', 'funk', 'soul', 'country', 'psychedelic', 'dub', 'trance', 'breakbeat', 'noise']

SCHEMA = '''
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, album TEXT, tags TEXT, duration REAL,
  downloads INTEGER, license TEXT, permalink TEXT, artwork TEXT, file TEXT NOT NULL, size INTEGER, added REAL);
CREATE TABLE IF NOT EXISTS albums (identifier TEXT PRIMARY KEY, seed TEXT, status TEXT, checked REAL);
CREATE TABLE IF NOT EXISTS seeds (seed TEXT PRIMARY KEY, page INTEGER NOT NULL DEFAULT 1, exhausted INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS tracks_downloads ON tracks(downloads DESC);
'''


def log(message):
    print(time.strftime('%Y-%m-%d %H:%M:%S'), message, file=sys.stderr, flush=True)


def open_db(path=LIB_DB):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    db = sqlite3.connect(path, timeout=30)
    db.execute('PRAGMA journal_mode=WAL')
    db.executescript(SCHEMA)
    return db


def get_json(url):
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def search_albums(seed, page, rows=50):
    query = f'collection:netlabels AND mediatype:audio AND licenseurl:*creativecommons* AND subject:"{seed}"'
    params = [('q', query), ('fl[]', 'identifier'), ('fl[]', 'downloads'), ('sort[]', 'downloads desc'),
              ('rows', str(rows)), ('page', str(page)), ('output', 'json')]
    data = get_json('https://archive.org/advancedsearch.php?' + urllib.parse.urlencode(params))
    return [(doc['identifier'], int(doc.get('downloads') or 0)) for doc in data['response']['docs']]


def seconds(value):
    """Archive lengths come as '245.3' or '4:05'."""
    try:
        parts = [float(x) for x in str(value).split(':')]
    except ValueError:
        return None
    total = 0.0
    for part in parts:
        total = total * 60 + part
    return total or None


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def plain(value):
    text = ' '.join(str(x) for x in as_list(value))
    return re.sub(r'<[^>]+>', '', text).strip()


def license_name(url):
    """'http://creativecommons.org/licenses/by-nc-sa/3.0/' -> 'CC BY-NC-SA 3.0'."""
    match = re.search(r'creativecommons\.org/(licenses|publicdomain)/([a-z-]+)/?([\d.]*)', url or '')
    if not match:
        return None
    kind, code, version = match.groups()
    if kind == 'publicdomain':
        return 'CC0' if code == 'zero' else 'Public Domain'
    return f'CC {code.upper()} {version}'.strip()


def pick_tracks(metadata):
    """Up to TRACKS_PER_ALBUM song-length mp3s in album order; an uploaded mp3 wins over Archive's 64 kbit copy."""
    files = [f for f in metadata.get('files', []) if f.get('name', '').lower().endswith('.mp3')]
    files.sort(key=lambda f: (f.get('source') != 'original', '_64kb' in f['name'].lower(), f['name'].lower()))
    chosen, seen = [], set()
    for f in files:
        length, size = seconds(f.get('length')), int(f.get('size') or 0)
        base = re.sub(r'(_vbr|_64kb|_128kb)?\.mp3$', '', f['name'].lower())
        if base in seen or not length or not MIN_SECONDS <= length <= MAX_SECONDS or not 0 < size <= MAX_FILE:
            continue
        seen.add(base)
        chosen.append((f, length, size))
        if len(chosen) >= TRACKS_PER_ALBUM:
            break
    return chosen


def safe_name(text):
    return re.sub(r'[^A-Za-z0-9._-]+', '_', text)[:120]


def download(url, path):
    tmp = path + '.part'
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request, timeout=120) as response, open(tmp, 'wb') as out:
        while True:
            chunk = response.read(1 << 16)
            if not chunk:
                break
            out.write(chunk)
    with open(tmp, 'rb') as check:
        head = check.read(3)
    if head[:3] != b'ID3' and head[:1] != b'\xff':  # an HTML error page is not an mp3
        os.remove(tmp)
        raise ValueError('not an mp3')
    os.replace(tmp, path)


class QuotaReached(Exception):
    """The store is full; the album is left unmarked so it is tried again once there is room."""


def used_bytes(db):
    return db.execute('SELECT COALESCE(SUM(size), 0) FROM tracks').fetchone()[0]


def harvest_album(db, identifier, downloads, seed):
    metadata = get_json('https://archive.org/metadata/' + urllib.parse.quote(identifier))
    meta = metadata.get('metadata', {})
    license_ = license_name(plain(meta.get('licenseurl')))
    if not license_:
        return 0
    tags = sorted({t.strip().lower() for s in as_list(meta.get('subject')) for t in re.split(r'[;,]', str(s)) if t.strip()} | {seed})
    album, artist = plain(meta.get('title')), plain(meta.get('creator')) or 'Unknown artist'
    added = 0
    for f, length, size in pick_tracks(metadata):
        if used_bytes(db) + size > QUOTA_BYTES:
            raise QuotaReached
        relative = os.path.join('ia', safe_name(identifier), safe_name(f['name']))
        path = os.path.join(FILES_DIR, relative)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        url = f'https://archive.org/download/{urllib.parse.quote(identifier)}/{urllib.parse.quote(f["name"])}'
        try:
            download(url, path)
        except Exception as error:
            log(f'skip {identifier}/{f["name"]}: {error}')
            continue
        title = plain(f.get('title')) or re.sub(r'^\d+[\s._-]*', '', os.path.splitext(f['name'])[0]).replace('_', ' ')
        db.execute('INSERT OR REPLACE INTO tracks VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', (
            f'ia:{identifier}/{f["name"]}', title, plain(f.get('artist') or f.get('creator')) or artist, album,
            ','.join(tags), length, downloads, license_, f'https://archive.org/details/{identifier}',
            f'https://archive.org/services/img/{identifier}', relative.replace(os.sep, '/'), os.path.getsize(path), time.time()))
        db.commit()
        added += 1
        time.sleep(PAUSE)
    return added


def run_round(db):
    total = 0
    for seed in SEEDS:
        if used_bytes(db) >= QUOTA_BYTES:
            log('quota reached')
            return total
        row = db.execute('SELECT page, exhausted FROM seeds WHERE seed=?', (seed,)).fetchone()
        page, exhausted = row if row else (1, 0)
        if exhausted:
            continue
        try:
            albums = search_albums(seed, page)
        except Exception as error:
            log(f'search {seed} failed: {error}')
            continue
        db.execute('INSERT OR REPLACE INTO seeds VALUES (?,?,?)', (seed, page + 1, 0 if albums else 1))
        db.commit()
        done = 0
        for identifier, downloads in albums:
            if done >= ALBUMS_PER_SEED_ROUND:
                break
            if db.execute('SELECT 1 FROM albums WHERE identifier=?', (identifier,)).fetchone():
                continue
            try:
                added = harvest_album(db, identifier, downloads, seed)
                status = 'ok' if added else 'empty'
            except QuotaReached:
                log('quota reached')
                return total
            except Exception as error:
                log(f'album {identifier} failed: {error}')
                added, status = 0, 'error'
            db.execute('INSERT OR REPLACE INTO albums VALUES (?,?,?,?)', (identifier, seed, status, time.time()))
            db.commit()
            done += 1
            total += added
        log(f'{seed}: +{total} so far, {used_bytes(db) / 1024 ** 3:.2f} GB used')
    return total


def main():
    os.makedirs(FILES_DIR, exist_ok=True)
    db = open_db()
    log(f'library: {db.execute("SELECT COUNT(*) FROM tracks").fetchone()[0]} tracks, quota {QUOTA_BYTES / 1024 ** 3:.0f} GB')
    while True:
        added = run_round(db)
        log(f'round done: +{added} tracks')
        # A round that found nothing new (quota or every seed exhausted) waits longer before trying again.
        time.sleep(ROUND_SLEEP if not added else 60)


if __name__ == '__main__':
    main()
