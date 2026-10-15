"""Accounts for «Волна»: a nickname and password, an avatar, and the listener's own state (likes, history,
taste, settings) so that every person gets their own music and recommendations on any device.

Passwords are stored only as PBKDF2-SHA256 hashes with a random salt; sessions are random tokens of which
only a SHA-256 digest is kept. Failed logins are rate limited per client address.
"""
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import threading
import time

ITERATIONS = 200_000
NAME_RE = re.compile(r'^[\w .-]{2,24}$', re.UNICODE)
MAX_STATE = 1_500_000
MAX_AVATAR = 300_000
AVATAR_RE = re.compile(r'^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$')
FAILS_ALLOWED, FAIL_WINDOW = 8, 600
SESSION_DAYS = 180

SCHEMA = '''
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE,
  salt BLOB NOT NULL, hash BLOB NOT NULL, avatar TEXT, color TEXT, state TEXT, state_updated REAL, created REAL NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created REAL NOT NULL);
'''


class AccountError(Exception):
    def __init__(self, status, code, message):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message


class Accounts:
    def __init__(self, path):
        if path != ':memory:':
            os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.executescript(SCHEMA)
        self.lock = threading.Lock()
        self.fails = {}

    # --- helpers -------------------------------------------------------------------------------------
    @staticmethod
    def _hash(password, salt):
        return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS)

    @staticmethod
    def _token_hash(token):
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    @staticmethod
    def _clean_name(name):
        name = ' '.join(str(name or '').split())
        if not NAME_RE.match(name):
            raise AccountError(400, 'bad_name', 'Ник: от 2 до 24 символов — буквы, цифры, пробел, точка, дефис или _')
        return name

    @staticmethod
    def _check_password(password):
        password = str(password or '')
        if not 6 <= len(password) <= 128:
            raise AccountError(400, 'bad_password', 'Пароль: от 6 до 128 символов')
        return password

    def _check_rate(self, client):
        now = time.time()
        recent = [t for t in self.fails.get(client, []) if now - t < FAIL_WINDOW]
        self.fails[client] = recent
        if len(recent) >= FAILS_ALLOWED:
            raise AccountError(429, 'too_many', 'Слишком много попыток. Попробуй через 10 минут')

    def _session(self, user_id):
        token = secrets.token_urlsafe(32)
        self.db.execute('INSERT INTO sessions VALUES (?,?,?)', (self._token_hash(token), user_id, time.time()))
        self.db.commit()
        return token

    def _profile(self, row):
        return {'name': row['name'], 'avatar': row['avatar'], 'color': row['color']}

    def _row(self, sql, args):
        self.db.row_factory = sqlite3.Row
        try:
            return self.db.execute(sql, args).fetchone()
        finally:
            self.db.row_factory = None

    # --- API -----------------------------------------------------------------------------------------
    def register(self, name, password, client=''):
        name, password = self._clean_name(name), self._check_password(password)
        salt = secrets.token_bytes(16)
        digest = self._hash(password, salt)
        with self.lock:
            self._check_rate(client)
            try:
                cur = self.db.execute('INSERT INTO users (name,name_key,salt,hash,created) VALUES (?,?,?,?,?)',
                                      (name, name.casefold(), salt, digest, time.time()))
            except sqlite3.IntegrityError:
                self.fails.setdefault(client, []).append(time.time())
                raise AccountError(409, 'name_taken', 'Такой ник уже занят')
            token = self._session(cur.lastrowid)
            return {'token': token, 'profile': {'name': name, 'avatar': None, 'color': None}, 'state': None}

    def login(self, name, password, client=''):
        with self.lock:
            self._check_rate(client)
            row = self._row('SELECT * FROM users WHERE name_key=?', (' '.join(str(name or '').split()).casefold(),))
            # The hash is computed even for unknown names, so timing does not reveal which nicknames exist.
            digest = self._hash(str(password or ''), row['salt'] if row else b'0' * 16)
            if not row or not hmac.compare_digest(digest, row['hash']):
                self.fails.setdefault(client, []).append(time.time())
                raise AccountError(401, 'bad_login', 'Неверный ник или пароль')
            token = self._session(row['id'])
            return {'token': token, 'profile': self._profile(row), 'state': json.loads(row['state']) if row['state'] else None,
                    'stateUpdated': row['state_updated']}

    def user_for(self, token):
        if not token:
            raise AccountError(401, 'no_session', 'Нужно войти')
        with self.lock:
            row = self._row('SELECT u.*, s.created AS session_created FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?',
                            (self._token_hash(token),))
            if not row or time.time() - row['session_created'] > SESSION_DAYS * 86400:
                raise AccountError(401, 'no_session', 'Сессия закончилась, войди снова')
            return row

    def me(self, token):
        row = self.user_for(token)
        return {'profile': self._profile(row), 'state': json.loads(row['state']) if row['state'] else None, 'stateUpdated': row['state_updated']}

    def save_state(self, token, state):
        row = self.user_for(token)
        text = json.dumps(state, ensure_ascii=False, separators=(',', ':'))
        if not isinstance(state, dict) or len(text.encode('utf-8')) > MAX_STATE:
            raise AccountError(413, 'state_too_big', 'Слишком много данных')
        now = time.time()
        with self.lock:
            self.db.execute('UPDATE users SET state=?, state_updated=? WHERE id=?', (text, now, row['id']))
            self.db.commit()
        return {'stateUpdated': now}

    def update_profile(self, token, changes):
        row = self.user_for(token)
        name, avatar, color = row['name'], row['avatar'], row['color']
        if 'name' in changes:
            name = self._clean_name(changes['name'])
        if 'avatar' in changes:
            avatar = changes['avatar']
            if avatar is not None:
                match = AVATAR_RE.match(str(avatar))
                if not match or len(avatar) > MAX_AVATAR:
                    raise AccountError(400, 'bad_avatar', 'Аватар должен быть картинкой до 200 КБ')
                base64.b64decode(match.group(2), validate=True)
        if 'color' in changes:
            color = changes['color'] if re.fullmatch(r'#[0-9a-fA-F]{6}', str(changes['color'] or '')) else None
        with self.lock:
            try:
                self.db.execute('UPDATE users SET name=?, name_key=?, avatar=?, color=? WHERE id=?', (name, name.casefold(), avatar, color, row['id']))
            except sqlite3.IntegrityError:
                raise AccountError(409, 'name_taken', 'Такой ник уже занят')
            self.db.commit()
        return {'profile': {'name': name, 'avatar': avatar, 'color': color}}

    def logout(self, token):
        with self.lock:
            self.db.execute('DELETE FROM sessions WHERE token_hash=?', (self._token_hash(token or ''),))
            self.db.commit()
        return {'ok': True}
