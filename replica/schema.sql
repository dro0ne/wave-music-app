-- «Волна»: библиотека, сопоставления источников и тексты.
-- Сейчас эти данные живут в IndexedDB браузера (те же имена хранилищ и полей).
-- Когда появится сервер, эта схема ляжет рядом с users/sessions из server/accounts.py
-- и будет синхронизироваться по updated_at.
--
-- Соглашения:
--   id      TEXT, crypto.randomUUID() на клиенте (записи без сети сливаются без конфликтов)
--   время   INTEGER, миллисекунды UTC
--   доступ  каждый серверный запрос фильтрует по user_id из токена сессии (RLS в SQLite нет)
--   удаление мягкое (deleted_at), чтобы удаление тоже синхронизировалось

PRAGMA foreign_keys = ON;

-- Трек как запись: одна строка на одну запись, независимо от источника.
CREATE TABLE IF NOT EXISTS tracks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  artists     TEXT NOT NULL,              -- JSON-массив имён
  album       TEXT,
  duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms > 0),
  isrc        TEXT,
  cover_url   TEXT,
  dedupe_key  TEXT NOT NULL,              -- WaveTrackModel.dedupeKey: артист|название|версия
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tracks_dedupe ON tracks (dedupe_key);
CREATE INDEX IF NOT EXISTS tracks_isrc ON tracks (isrc) WHERE isrc IS NOT NULL;

-- Где трек можно включить. Общая для всех пользователей: сопоставление не личное.
CREATE TABLE IF NOT EXISTS track_sources (
  track_id    TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  source      TEXT NOT NULL CHECK (source IN ('local','audius','archive','jamendo','library','spotify','youtube')),
  source_id   TEXT,                       -- NULL, если искали и не нашли
  status      TEXT NOT NULL CHECK (status IN ('found','not_found','unavailable')),
  confidence  REAL NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
  checked_at  INTEGER NOT NULL,           -- чтобы перепроверять not_found не чаще раза в месяц
  PRIMARY KEY (track_id, source)
);
CREATE INDEX IF NOT EXISTS track_sources_lookup ON track_sources (source, source_id);

CREATE TABLE IF NOT EXISTS playlists (
  id          TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  description TEXT CHECK (description IS NULL OR length(description) <= 300),
  cover_url   TEXT,
  kind        TEXT NOT NULL DEFAULT 'user' CHECK (kind IN ('user','imported','local','downloaded')),
  source_url  TEXT,                       -- откуда импортирован
  pinned      INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0,1)),
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  deleted_at  INTEGER
);
CREATE INDEX IF NOT EXISTS playlists_user ON playlists (user_id, pinned DESC, position);
CREATE INDEX IF NOT EXISTS playlists_sync ON playlists (user_id, updated_at);

CREATE TABLE IF NOT EXISTS playlist_tracks (
  id          TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id    TEXT NOT NULL REFERENCES tracks(id) ON DELETE RESTRICT,  -- трек не исчезает из чужих плейлистов
  position    REAL NOT NULL,              -- дробные позиции: перестановка меняет одну строку
  added_at    INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  deleted_at  INTEGER,
  UNIQUE (playlist_id, track_id)
);
CREATE INDEX IF NOT EXISTS playlist_tracks_order ON playlist_tracks (playlist_id, position);
CREATE INDEX IF NOT EXISTS playlist_tracks_track ON playlist_tracks (track_id);

-- Кэш текстов LRCLIB. Ручной сдвиг личный, поэтому вынесен в lyrics_offsets.
CREATE TABLE IF NOT EXISTS lyrics (
  track_id    TEXT PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('synced','plain','none')),
  body        TEXT,                       -- LRC или простой текст
  lrclib_id   INTEGER,
  fetched_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lyrics_offsets (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id    TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  offset_ms   INTEGER NOT NULL CHECK (offset_ms BETWEEN -30000 AND 30000),
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, track_id)
);

CREATE TABLE IF NOT EXISTS eq_presets (
  id          TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
  bands_db    TEXT NOT NULL,              -- JSON: 10 значений от -12 до 12 дБ (31 Гц … 16 кГц)
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  deleted_at  INTEGER
);
CREATE INDEX IF NOT EXISTS eq_presets_user ON eq_presets (user_id);

CREATE TABLE IF NOT EXISTS import_jobs (
  id          TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  service     TEXT NOT NULL CHECK (service IN ('yandex','spotify','deezer','apple','soundcloud','youtube','text')),
  status      TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','paused','done','failed')),
  total       INTEGER NOT NULL DEFAULT 0,
  matched     INTEGER NOT NULL DEFAULT 0,
  cursor      INTEGER NOT NULL DEFAULT 0, -- сколько строк обработано: импорт продолжается с места
  playlist_id TEXT REFERENCES playlists(id) ON DELETE SET NULL,
  error       TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  CHECK (matched <= total AND cursor <= total)
);
CREATE INDEX IF NOT EXISTS import_jobs_user ON import_jobs (user_id, created_at DESC);

-- local_files в схему не входит: дескрипторы файлов существуют только в браузере (IndexedDB).
