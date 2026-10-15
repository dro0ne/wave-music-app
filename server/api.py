"""Catalog cache and key holder for «Волна».

Sits behind nginx at /api/. Proxies the catalog requests the site makes to Audius and Jamendo,
keeps their JSON in SQLite so repeated waves start fast and survive an upstream outage, and adds
API keys that must not live in the browser. Upstream audio streams are never proxied or stored.
It also lists the server's own Creative Commons library (filled by library.py, files served by nginx).
Standard library only, so the stock python image runs it without a build step.
"""
import json
import os
import re
import sqlite3
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get('PORT', '8000'))
CACHE_DB = os.environ.get('CACHE_DB', '/data/cache.db')
JAMENDO_CLIENT_ID = os.environ.get('JAMENDO_CLIENT_ID', '').strip()
AUDIUS_API = os.environ.get('AUDIUS_API', 'https://api.audius.co/v1')
JAMENDO_API = os.environ.get('JAMENDO_API', 'https://api.jamendo.com/v3.0')
UPSTREAM_TIMEOUT = float(os.environ.get('UPSTREAM_TIMEOUT', '12'))
# A cached answer is still served when the upstream fails, for at most this long.
STALE_LIMIT = 3 * 24 * 3600
USER_AGENT = 'wave-music-cache/1.0'
MAX_URL = 2048
LIB_DB = os.environ.get('LIB_DB', '/music/library.db')
LIBRARY_FIELDS = 'id, title, artist, album, tags, duration, downloads, license, permalink, artwork, file'

HOUR = 3600
# (route pattern, upstream base, fresh seconds). Only these catalog reads are proxied.
ROUTES = [
    (re.compile(r'^/api/audius/v1/tracks/search$'), lambda: AUDIUS_API + '/tracks/search', 6 * HOUR),
    (re.compile(r'^/api/audius/v1/tracks/trending$'), lambda: AUDIUS_API + '/tracks/trending', HOUR // 2),
    (re.compile(r'^/api/audius/v1/tracks/latest$'), lambda: AUDIUS_API + '/tracks/latest', HOUR // 4),
    (re.compile(r'^/api/jamendo/tracks/?$'), lambda: JAMENDO_API + '/tracks/', 6 * HOUR),
]


class Cache:
    def __init__(self, path):
        if path != ':memory:':
            os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, body BLOB NOT NULL, fetched REAL NOT NULL)')
        self.lock = threading.Lock()
        self.writes = 0
        self.purge()

    def get(self, key):
        with self.lock:
            row = self.db.execute('SELECT body, fetched FROM cache WHERE key=?', (key,)).fetchone()
        return (row[0], row[1]) if row else (None, 0)

    def put(self, key, body):
        with self.lock:
            self.db.execute('INSERT OR REPLACE INTO cache (key, body, fetched) VALUES (?, ?, ?)', (key, body, time.time()))
            self.db.commit()
            self.writes += 1
            purge = self.writes % 500 == 0
        if purge:
            self.purge()

    def purge(self):
        with self.lock:
            self.db.execute('DELETE FROM cache WHERE fetched < ?', (time.time() - STALE_LIMIT,))
            self.db.commit()

    def count(self):
        with self.lock:
            return self.db.execute('SELECT COUNT(*) FROM cache').fetchone()[0]


cache = None
# One upstream request per cache key at a time; parallel waves asking the same page share it.
key_locks = {}
key_locks_guard = threading.Lock()


def key_lock(key):
    with key_locks_guard:
        if len(key_locks) > 2000:
            key_locks.clear()
        return key_locks.setdefault(key, threading.Lock())


def fetch_upstream(url):
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept': 'application/json'})
    with urllib.request.urlopen(request, timeout=UPSTREAM_TIMEOUT) as response:
        body = response.read()
    json.loads(body)  # an HTML error page from a CDN must not be cached as a catalog
    return body


def resolve(path, query):
    """Returns (upstream url, cache key, fresh seconds) or None for a path that is not proxied."""
    for pattern, base, fresh in ROUTES:
        if not pattern.match(path):
            continue
        params = [(k, v) for k, v in urllib.parse.parse_qsl(query, keep_blank_values=True) if k != 'client_id']
        if '/jamendo/' in path:
            if not JAMENDO_CLIENT_ID:
                return 'jamendo-disabled'
            upstream_params = [('client_id', JAMENDO_CLIENT_ID)] + params
        else:
            upstream_params = params
        key = path + '?' + urllib.parse.urlencode(sorted(params))
        return base() + '?' + urllib.parse.urlencode(upstream_params), key, fresh
    return None


def respond_catalog(path, query):
    """Returns (status, body bytes, cache state)."""
    target = resolve(path, query)
    if target is None:
        return 404, b'{"error":"not found"}', 'NONE'
    if target == 'jamendo-disabled':
        return 503, b'{"error":"jamendo is not configured"}', 'NONE'
    url, key, fresh = target
    body, fetched = cache.get(key)
    if body is not None and time.time() - fetched < fresh:
        return 200, body, 'HIT'
    with key_lock(key):
        body, fetched = cache.get(key)
        if body is not None and time.time() - fetched < fresh:
            return 200, body, 'HIT'
        try:
            fresh_body = fetch_upstream(url)
        except (urllib.error.URLError, TimeoutError, ValueError, OSError) as error:
            log(f'upstream failed {key}: {error}')
            if body is not None:
                return 200, body, 'STALE'
            return 502, b'{"error":"upstream unavailable"}', 'NONE'
        cache.put(key, fresh_body)
        return 200, fresh_body, 'MISS'


def library_db():
    """Read-only view of the harvester's database, or None while it does not exist yet."""
    if not os.path.exists(LIB_DB):
        return None
    db = sqlite3.connect(f'file:{LIB_DB}?mode=ro', uri=True, timeout=5)
    db.row_factory = sqlite3.Row
    return db


def library_count():
    db = library_db()
    if db is None:
        return 0
    try:
        return db.execute('SELECT COUNT(*) FROM tracks').fetchone()[0]
    except sqlite3.Error:
        return 0
    finally:
        db.close()


def library_tracks(query):
    """GET /api/library/tracks?terms=rock|post rock&sort=popular|new|random&limit=&offset="""
    params = dict(urllib.parse.parse_qsl(query))
    terms = [t.strip().lower() for t in params.get('terms', '').split('|') if t.strip()][:12]
    # Archive subjects are written both "post rock" and "postrock", so each term also matches its compact form.
    words = sorted({w for t in terms for w in (t, t.replace(' ', ''), t.replace(' ', '-')) if len(w) >= 2})
    limit = max(1, min(100, int(params.get('limit') or 50)))
    offset = max(0, int(params.get('offset') or 0))
    order = {'new': 'added DESC', 'random': 'random()'}.get(params.get('sort'), 'downloads DESC, id')
    where, args = '', []
    if words:
        where = 'WHERE ' + ' OR '.join(['(tags LIKE ? OR title LIKE ? OR album LIKE ?)'] * len(words))
        for w in words:
            args += [f'%{w}%'] * 3
    db = library_db()
    if db is None:
        return []
    try:
        rows = db.execute(f'SELECT {LIBRARY_FIELDS} FROM tracks {where} ORDER BY {order} LIMIT ? OFFSET ?', args + [limit, offset]).fetchall()
    finally:
        db.close()
    return [{**{k: row[k] for k in row.keys() if k != 'file'}, 'stream': 'media/' + urllib.parse.quote(row['file'])} for row in rows]


def log(message):
    print(time.strftime('%Y-%m-%d %H:%M:%S'), message, file=sys.stderr, flush=True)


class Handler(BaseHTTPRequestHandler):
    server_version = 'wave-api'
    sys_version = ''

    def do_GET(self):
        if len(self.path) > MAX_URL:
            return self.send(414, b'{"error":"url too long"}')
        path, _, query = self.path.partition('?')
        if path == '/api/health':
            body = json.dumps({'ok': True, 'jamendo': bool(JAMENDO_CLIENT_ID), 'cached': cache.count(), 'library': library_count()}).encode()
            return self.send(200, body)
        if path == '/api/library/tracks':
            try:
                body = json.dumps({'data': library_tracks(query)}, ensure_ascii=False).encode()
            except (ValueError, sqlite3.Error) as error:
                log(f'library query failed: {error!r}')
                return self.send(400, b'{"error":"bad library query"}')
            return self.send(200, body)
        try:
            status, body, state = respond_catalog(path, query)
        except Exception as error:  # a bug in one request must not take the cache down
            log(f'error {path}: {error!r}')
            return self.send(500, b'{"error":"internal"}')
        self.send(status, body, state)

    def send(self, status, body, state=None):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        if state:
            self.send_header('X-Cache', state)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def main():
    global cache
    cache = Cache(CACHE_DB)
    server = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    server.daemon_threads = True
    log(f'listening on {PORT}, jamendo {"on" if JAMENDO_CLIENT_ID else "off"}, {cache.count()} cached')
    server.serve_forever()


if __name__ == '__main__':
    main()
