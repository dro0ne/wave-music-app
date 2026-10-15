"""«Волна» doctor: finds out why the site is slow, what is broken and why music repeats.

Lab checks drive real browsers (Playwright: Chromium, WebKit = Safari, Firefox) against the site; field checks read
the reports real phones sent to the server (telemetry.js -> /api/telemetry), fetched over SSH. Everything ends up
in one HTML report with plain-language verdicts.

    python tools/doctor/doctor.py                      # full check of the home server, opens the report
    python tools/doctor/doctor.py --quick              # fewer browsers and tracks
    python tools/doctor/doctor.py --url https://dro0ne.github.io/wave-music-app/ --no-field

First run: tools/doctor/setup.ps1 (creates .venv and downloads the browsers).
"""
import argparse
import datetime as dt
import html
import json
import os
import statistics
import subprocess
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(HERE / '.browsers'))
from playwright.sync_api import sync_playwright  # noqa: E402

GPU_ARGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
PHONE_CHROMIUM = {'viewport': {'width': 412, 'height': 915}, 'device_scale_factor': 2.6, 'is_mobile': True, 'has_touch': True}
OK, WARN, BAD, INFO = 'ok', 'warn', 'bad', 'info'


def lab_context(browser, **options):
    """A browser context whose page never sends field reports, so lab runs do not pollute real-device data."""
    context = browser.new_context(**options)
    context.add_init_script('window.__WAVE_NO_TELEMETRY__ = true')
    return context


def log(message):
    print(f'[{time.strftime("%H:%M:%S")}] {message}', flush=True)


def plural(n, one, few, many):
    n = abs(int(n))
    return one if n % 10 == 1 and n % 100 != 11 else few if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14 else many


def percentile(values, q):
    values = sorted(values)
    return values[min(len(values) - 1, int(len(values) * q))] if values else None


class Report:
    def __init__(self, url):
        self.url, self.sections, self.data = url, [], {}

    def section(self, title, verdict, summary, rows=None, notes=None, raw=None):
        self.sections.append({'title': title, 'verdict': verdict, 'summary': summary, 'rows': rows or [], 'notes': notes or []})
        if raw is not None:
            self.data[title] = raw


# --- lab: load, errors, layout --------------------------------------------------------------------------------
def check_load(p, report, url, quick):
    cases = [('webkit', 'iPhone (Safari)', 'iPhone 15'), ('chromium', 'Android (Chrome)', PHONE_CHROMIUM),
             ('firefox', 'Компьютер (Firefox)', {'viewport': {'width': 1440, 'height': 900}}),
             ('chromium', 'Компьютер (Chrome)', {'viewport': {'width': 1440, 'height': 900}})]
    if quick:
        cases = cases[:2]
    rows, raw, worst = [], [], OK
    for engine, name, device in cases:
        options = p.devices[device] if isinstance(device, str) else device
        if engine == 'firefox':
            options = {k: v for k, v in options.items() if k not in ('is_mobile', 'has_touch')}
        browser = getattr(p, engine).launch()
        page = lab_context(browser, **options).new_page()
        errors, failed = [], []
        page.on('pageerror', lambda e: errors.append(str(e)[:160]))
        # 'Failed to load resource' repeats a failed request, which is reported with its address below.
        page.on('console', lambda m: errors.append('console: ' + m.text[:160]) if m.type == 'error' and not m.text.startswith('Failed to load resource') else None)
        page.on('requestfailed', lambda r: failed.append(f'{r.url[:90]} ({r.failure})') if '/media/' not in r.url and 'stream' not in r.url else None)
        page.on('response', lambda r: failed.append(f'{r.status} {r.url[:90]}') if r.status >= 400 and '/api/account/me' not in r.url and '/api/health' not in r.url else None)
        start = time.time()
        page.goto(url, wait_until='load', timeout=60000)
        load_ms = round((time.time() - start) * 1000)
        page.wait_for_timeout(2500)
        layout = page.evaluate("""() => ({width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          wide: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 &&
            getComputedStyle(e).position !== 'fixed' && !e.closest('.moods,#genres,.mobile-nav,.full-player,.bottom-sheet,.music-results,.wavefield') })
            .slice(0, 4).map(e => (e.id ? '#' + e.id : e.tagName.toLowerCase()) + '.' + String(e.className).split(' ')[0])})""")
        browser.close()
        verdict = BAD if errors else WARN if failed or layout['scrollWidth'] > layout['width'] or load_ms > 5000 else OK
        worst = max(worst, verdict, key=[OK, WARN, BAD].index)
        rows.append([name, f'{load_ms} мс', len(errors), len(failed), 'да' if layout['scrollWidth'] > layout['width'] else 'нет', verdict])
        raw.append({'browser': name, 'loadMs': load_ms, 'errors': errors[:10], 'failedRequests': failed[:10], 'layout': layout})
        log(f'load {name}: {load_ms} ms, {len(errors)} errors, {len(failed)} failed requests')
    notes = [f'{r["browser"]}: {e}' for r in raw for e in r['errors'][:3]] + [f'{r["browser"]}: запрос {f}' for r in raw for f in r['failedRequests'][:3]] + \
            [f'{r["browser"]}: вылезает за экран {", ".join(r["layout"]["wide"])}' for r in raw if r['layout']['wide']]
    summary = {OK: 'Сайт открывается во всех браузерах без ошибок.', WARN: 'Открывается, но есть замечания (см. ниже).', BAD: 'В браузерах есть ошибки JavaScript — что-то может не работать.'}[worst]
    report.section('Загрузка и ошибки', worst, summary, [['Браузер', 'Загрузка', 'Ошибки JS', 'Упавшие запросы', 'Шире экрана', '']] + rows, notes, raw)


# --- lab: scrolling --------------------------------------------------------------------------------------------
SCROLL_JS = """async () => { const frames = []; let last = performance.now(), on = true;
  const tick = now => { frames.push(now - last); last = now; if (on) requestAnimationFrame(tick) }; requestAnimationFrame(tick);
  const max = document.documentElement.scrollHeight - innerHeight;
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i <= 60; i++) { scrollTo({top: (pass ? 60 - i : i) / 60 * max, behavior: 'instant'}); await new Promise(r => setTimeout(r, 16)) }
  on = false; frames.sort((a, b) => a - b); return {frames: frames.length, median: frames[frames.length >> 1], p90: frames[Math.floor(frames.length * .9)], janky: frames.filter(f => f > 34).length} }"""


def check_scroll(p, report, url):
    browser = p.chromium.launch(args=GPU_ARGS)
    page = lab_context(browser, **PHONE_CHROMIUM).new_page()
    page.goto(url, wait_until='load')
    page.wait_for_timeout(2000)
    page.evaluate("window.waveBackdrop?.setState?.('PLAYING')")
    cdp = page.context.new_cdp_session(page)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    page.wait_for_timeout(600)
    result = min((page.evaluate(SCROLL_JS) for _ in range(2)), key=lambda r: r['p90'])
    browser.close()
    share = result['janky'] / max(1, result['frames'])
    verdict = OK if share < .05 else WARN if share < .2 else BAD
    log(f'scroll: median {result["median"]:.1f} ms, janky {result["janky"]}/{result["frames"]}')
    report.section('Плавность прокрутки (телефон, процессор ×4 медленнее)', verdict,
                   f'Кадр в среднем {result["median"]:.1f} мс ({1000 / max(1, result["median"]):.0f} FPS), рывков {result["janky"]} из {result["frames"]} кадров.',
                   [['Медиана кадра', 'Хуже 90% кадров', 'Рывков (>34 мс)'], [f'{result["median"]:.1f} мс', f'{result["p90"]:.1f} мс', result['janky']]],
                   [] if verdict == OK else ['Рывки при прокрутке обычно дают тяжёлые CSS-фильтры, размытие и анимация больших слоёв.'], result)


# --- lab: track switching --------------------------------------------------------------------------------------
LONG_TASKS_INIT = "window.__long=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__long.push(Math.round(e.duration))}).observe({type:'longtask',buffered:true})}catch{}"
NEXT_JS = "([...document.querySelectorAll('[data-player-action=next]')].find(b=>b.offsetParent)||document.querySelector('#next')).click()"


def start_wave(page, timeout_s=40):
    page.click('#waveOrb')
    for _ in range(timeout_s * 2):
        page.wait_for_timeout(500)
        if page.evaluate("document.body.classList.contains('wave-playing')"):
            return True
    return False


def wait_new_track(page, previous, timeout_s=25):
    start = time.time()
    while time.time() - start < timeout_s:
        state = page.evaluate("({id:String((typeof current==='function'?current():null)?.id||''),playing:document.body.classList.contains('wave-playing')})")
        if state['id'] and state['id'] != previous and state['playing']:
            return round((time.time() - start) * 1000)
        page.wait_for_timeout(100)
    return None


def check_switching(p, report, url, switches=5):
    browser = p.chromium.launch(args=GPU_ARGS)
    page = lab_context(browser, **PHONE_CHROMIUM).new_page()
    page.add_init_script(LONG_TASKS_INIT)
    page.goto(url, wait_until='load')
    page.wait_for_timeout(1500)
    if not start_wave(page):
        browser.close()
        report.section('Переключение треков', BAD, 'Волна не заиграла за 40 секунд — проверить источники музыки.', notes=['Кнопка волны нажата, но звук не начался.'])
        return
    page.wait_for_timeout(2500)
    cdp = page.context.new_cdp_session(page)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    cdp.send('Profiler.enable')
    cdp.send('Profiler.setSamplingInterval', {'interval': 250})
    page.evaluate('window.__long=[]')
    cdp.send('Profiler.start')
    waits, lags = [], []
    for _ in range(switches):
        previous = page.evaluate("String((typeof current==='function'?current():null)?.id||'')")
        page.evaluate(NEXT_JS)
        lags.append(page.evaluate("new Promise(r=>{const t=performance.now();setTimeout(()=>r(Math.round(performance.now()-t)),0)})"))
        waits.append(wait_new_track(page, previous))
        page.wait_for_timeout(800)
    profile = cdp.send('Profiler.stop')['profile']
    longs = page.evaluate('window.__long')
    browser.close()
    nodes = {n['id']: n for n in profile['nodes']}
    hot = Counter()
    for sid, delta in zip(profile['samples'], profile['timeDeltas']):
        frame = nodes[sid]['callFrame']
        if frame['url']:
            hot[f"{frame['functionName'] or '(анонимная)'} — {frame['url'].split('/')[-1].split('?')[0]}:{frame['lineNumber'] + 1}"] += delta / 1000
    worst = max(longs or [0])
    got = [w for w in waits if w is not None]
    verdict = BAD if worst > 1000 or len(got) < switches else WARN if worst > 400 else OK
    log(f'switching: worst freeze {worst} ms, waits {waits}')
    rows = [['Худшее зависание', 'Суммарно', 'До нового трека (медиана)', 'Не переключилось'],
            [f'{worst} мс', f'{sum(longs)} мс', f'{statistics.median(got):.0f} мс' if got else '—', switches - len(got)]]
    notes = ['Самые тяжёлые функции (собственное время за все переключения):'] + [f'{ms:.0f} мс — {name}' for name, ms in hot.most_common(8)]
    summary = (f'За {switches} {plural(switches, "переключение", "переключения", "переключений")} худшее зависание {worst} мс на телефоне среднего уровня. '
               + ('Кнопки отвечают сразу.' if verdict == OK else 'Пользователь заметит подвисание.' if verdict == WARN else 'Страница заметно зависает — смотри функции ниже.'))
    report.section('Переключение треков (телефон, процессор ×4 медленнее)', verdict, summary, rows, notes,
                   {'longTasks': longs, 'waitsMs': waits, 'timerLagMs': lags, 'hot': hot.most_common(15)})


# --- lab: music quality ----------------------------------------------------------------------------------------
TRACK_JS = """() => { const t = (typeof current==='function'?current():null); if (!t) return null; const map = typeof genreMap !== 'undefined' ? genreMap : {}, labels = (state.genres || []).map(l => map[l] || l);
  const levels = labels.map(l => WaveGenre.match(t, l).level); const d = window.waveDiagnostics?.() || {};
  return {id: String(t.id), title: t.title, artist: t.artist, source: t.activeSource || t.source, genre: t.normalizedGenre, rawGenre: t.genre,
    duration: Math.round(t.duration || 0), plays: t.plays ?? null, beat: !!t.beat, song: WaveGenre.isSong ? WaveGenre.isSong(t, labels) : true,
    match: levels.includes('EXACT') ? 'EXACT' : levels.find(l => l !== 'NONE') || (labels.length ? 'NONE' : 'ALL'),
    key: WaveTrackModel.dedupeKey(t), catalog: d.catalogSize ?? null, matched: d.matchedGenreCount ?? null, eligible: d.eligibleCount ?? null,
    mood: state.mood, genres: state.genres }}"""


def check_music(p, report, url, tracks, mood, genres):
    browser = p.chromium.launch(args=GPU_ARGS)
    page = lab_context(browser, viewport={'width': 1280, 'height': 900}).new_page()
    failures = []
    page.on('console', lambda m: failures.append(m.text[:140]) if 'STREAM_VALIDATE_FAILED' in m.text or 'STREAM_RESOLVE_FAILED' in m.text else None)
    page.goto(url, wait_until='load')
    page.wait_for_timeout(1500)
    if mood or genres:
        page.evaluate("([mood, genres]) => { const s = JSON.parse(localStorage.getItem('waveState') || '{}'); if (mood) s.mood = mood; if (genres) s.genres = genres; localStorage.setItem('waveState', JSON.stringify(s)) }", [mood, genres])
        page.reload(wait_until='load')
        page.wait_for_timeout(1500)
    if not start_wave(page, 60):
        browser.close()
        report.section('Подбор музыки', BAD, 'Волна не заиграла — проверить источники музыки.')
        return
    played, waits = [], []
    for i in range(tracks):
        info = page.evaluate(TRACK_JS)
        if info:
            played.append(info)
        if i == tracks - 1:
            break
        page.wait_for_timeout(1200)
        previous = info['id'] if info else ''
        page.evaluate(NEXT_JS)
        waits.append(wait_new_track(page, previous))
        log(f'music {i + 1}/{tracks}: {info["artist"][:20] if info else "?"} — {info["title"][:30] if info else "?"}')
    browser.close()
    report.data['tracks'] = played
    analyse_music(report, played, waits, failures, 'Подбор музыки (лаборатория)')


def analyse_music(report, played, waits, failures, title, field=False):
    if not played:
        report.section(title, INFO, 'Нет данных о прослушанных треках.')
        return
    ids, keys = Counter(t['id'] for t in played), Counter(t.get('key') or f"{t['artist']}|{t['title']}".lower() for t in played)
    repeats = [t for t in played if ids[t['id']] > 1]
    same_song = sum(c - 1 for c in keys.values() if c > 1)
    streaks = sum(1 for a, b in zip(played, played[1:]) if a['artist'] and a['artist'] == b['artist'])
    artists = Counter(t['artist'] for t in played)
    heavy = [(a, c) for a, c in artists.most_common(3) if c >= max(3, len(played) // 5)]
    off_genre = [t for t in played if t.get('match') == 'NONE']
    spoken = [t for t in played if t.get('song') is False]
    beats = [t for t in played if t.get('beat') and t.get('genre') == 'hiphop']
    sources = Counter(t.get('source') or '?' for t in played)
    got = [w for w in waits if w is not None]
    problems = []
    if same_song:
        why = ''
        last = played[-1]
        if last.get('eligible') is not None and last['eligible'] < 30:
            why = f" Причина: после фильтров осталось всего {last['eligible']} треков из {last.get('catalog')} в каталоге — выбери больше жанров или подними «Сколько новой музыки»."
        problems.append(f'Повторы: {same_song} раз одна и та же песня.{why}')
    if streaks:
        problems.append(f'Один исполнитель подряд: {streaks} раз.')
    for artist, count in heavy:
        problems.append(f'«{artist}» звучит слишком часто: {count} из {len(played)}.')
    if off_genre:
        problems.append(f'Мимо выбранных жанров: {len(off_genre)} треков (' + '; '.join(f"{t['artist']} — {t['title']} [{t.get('rawGenre') or t.get('genre')}]" for t in off_genre[:4]) + ').')
    if spoken:
        problems.append('Не песни (подкаст, аудиокнига, длинный микс): ' + '; '.join(f"{t['artist']} — {t['title']}" for t in spoken[:4]))
    if beats:
        problems.append(f'Минусовки в рэпе: {len(beats)}.')
    if failures:
        problems.append(f'Не запустились: {len(failures)} треков (пропущены автоматически).')
    if got and statistics.median(got) > 4000:
        problems.append(f'Долго ждать следующий трек: в среднем {statistics.median(got) / 1000:.1f} с.')
    verdict = BAD if same_song > 1 or len(off_genre) > len(played) * .2 or spoken else WARN if problems else OK
    summary = f'{len(played)} {plural(len(played), "трек", "трека", "треков")}{" из реальных прослушиваний" if field else ""}: ' + ('всё в порядке — без повторов, в жанре.' if not problems else f'{len(problems)} замечаний.')
    rows = [['Треков', 'Разных', 'Повторов', 'Мимо жанра', 'Не песни', 'Источники', 'Ожидание (медиана)'],
            [len(played), len(ids), same_song, len(off_genre), len(spoken), ', '.join(f'{s} {c}' for s, c in sources.most_common()),
             f'{statistics.median(got) / 1000:.1f} с' if got else '—']]
    listing = [f"{i + 1}. {t['artist']} — {t['title']} · {t.get('genre') or '?'} · {t.get('source')}" + (' · ПОВТОР' if t in repeats else '') for i, t in enumerate(played[:40])]
    report.section(title, verdict, summary, rows, problems + (['Что играло:'] + listing if not field else []), {'tracks': played, 'waits': waits, 'failures': failures})


# --- field: what real devices reported -------------------------------------------------------------------------
DUMP = r'''
import json, sqlite3, sys, time
days = float(sys.argv[1]) if len(sys.argv) > 1 else 7
try:
    db = sqlite3.connect("file:/data/telemetry.db?mode=ro", uri=True)
    rows = db.execute("SELECT received, device, context, kind, data FROM events WHERE received > ? ORDER BY received", (time.time() - days * 86400,)).fetchall()
except sqlite3.Error:
    rows = []
print(json.dumps([{"at": r[0], "device": r[1], "context": json.loads(r[2] or "{}"), "kind": r[3], "data": json.loads(r[4] or "{}")} for r in rows]))
'''


def fetch_field(target, key, days):
    command = ['ssh', '-i', os.path.expanduser(key), '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', target, f'docker exec -i wave-api python - {days}']
    result = subprocess.run(command, input=DUMP, capture_output=True, text=True, encoding='utf-8', timeout=120)
    if result.returncode:
        raise RuntimeError(result.stderr.strip()[:300] or 'ssh failed')
    return json.loads(result.stdout or '[]')


def describe_device(context):
    ua = context.get('ua', '')
    kind = 'iPhone' if 'iPhone' in ua else 'iPad' if 'iPad' in ua else 'Android' if 'Android' in ua else 'Windows' if 'Windows' in ua else 'Mac' if 'Mac' in ua else 'устройство'
    who = context.get('user')
    return f"{kind} {context.get('screen', '')}" + (f' ({who})' if who else '')


def check_field(report, events, days):
    if not events:
        report.section('Реальные устройства', INFO, f'За {days:g} дн. отчётов нет. Они появятся, когда кто-то послушает волну на сервере (в профиле включено «Отчёты о работе»).')
        return
    by_device = defaultdict(list)
    for e in events:
        by_device[e['device']].append(e)
    rows, notes, worst_verdict = [['Устройство', 'Зависаний', 'Худшее', 'FPS (мин/сред)', 'Ждать трек (медиана)', 'Ошибок', 'Не запустилось']], [], OK
    all_plays = []
    errors = Counter()
    for device, items in by_device.items():
        context = items[-1]['context']
        longs = [x['data'] for x in items if x['kind'] == 'longtasks']
        count, worst = sum(x.get('count', 0) for x in longs), max([w.get('ms', 0) for x in longs for w in x.get('worst', [])] or [0])
        fps = [x['data'] for x in items if x['kind'] == 'fps']
        fps_min, fps_avg = (min(x['min'] for x in fps), round(statistics.mean(x['avg'] for x in fps))) if fps else (None, None)
        plays = [x['data'] for x in items if x['kind'] == 'play']
        waits = [x['waitMs'] for x in plays if x.get('waitMs')]
        failed = sum(1 for x in items if x['kind'] == 'failed')
        for x in items:
            if x['kind'] == 'error':
                errors[f"{x['data'].get('message')} ({x['data'].get('where')})"] += 1
        device_errors = sum(1 for x in items if x['kind'] == 'error')
        verdict = BAD if worst > 1500 or (fps_min is not None and fps_min < 20) or device_errors else WARN if worst > 500 or (fps_avg and fps_avg < 45) else OK
        worst_verdict = max(worst_verdict, verdict, key=[OK, WARN, BAD].index)
        rows.append([describe_device(context), count, f'{worst} мс', f'{fps_min}/{fps_avg}' if fps else '—', f'{statistics.median(waits) / 1000:.1f} с' if waits else '—', device_errors, failed])
        slow_after = Counter(w.get('after') or 'само по себе' for x in longs for w in x.get('worst', []) if w.get('ms', 0) > 300)
        if slow_after:
            notes.append(f'{describe_device(context)}: зависания чаще всего после — ' + ', '.join(f'{a} ({c})' for a, c in slow_after.most_common(3)))
        for x in plays:
            if x.get('track'):
                all_plays.append({**x['track'], 'key': f"{x['track'].get('artist', '')}|{x['track'].get('title', '')}".lower(), 'device': device})
    notes += [f'Ошибка ×{c}: {m}' for m, c in errors.most_common(6)]
    report.section(f'Реальные устройства (за {days:g} дн.)', worst_verdict,
                   f'{len(by_device)} {plural(len(by_device), "устройство прислало", "устройства прислали", "устройств прислали")} отчёты. ' + {OK: 'Тормозов и ошибок не видно.', WARN: 'Есть заметные подвисания.', BAD: 'Есть серьёзные зависания или ошибки.'}[worst_verdict],
                   rows, notes, {'devices': len(by_device), 'events': len(events)})
    if all_plays:
        analyse_music(report, all_plays[-200:], [], [], 'Подбор музыки (реальные прослушивания)', field=True)


# --- HTML ------------------------------------------------------------------------------------------------------
def render_html(report, path):
    badge = {OK: ('✓', 'Хорошо'), WARN: ('!', 'Есть замечания'), BAD: ('✗', 'Проблема'), INFO: ('i', 'Информация')}
    parts = []
    for s in report.sections:
        mark, word = badge[s['verdict']]
        table = ''
        if s['rows']:
            head, *body = s['rows']
            cell = lambda v: f'<td class="v-{v}">{badge[v][1]}</td>' if v in badge else f'<td>{html.escape(str(v))}</td>'
            table = '<table><thead><tr>' + ''.join(f'<th>{html.escape(str(h))}</th>' for h in head) + '</tr></thead><tbody>' + \
                    ''.join('<tr>' + ''.join(cell(v) for v in row) + '</tr>' for row in body) + '</tbody></table>'
        notes = '<ul>' + ''.join(f'<li>{html.escape(n)}</li>' for n in s['notes']) + '</ul>' if s['notes'] else ''
        parts.append(f'<section class="card v-{s["verdict"]}"><header><span class="mark">{mark}</span><div><h2>{html.escape(s["title"])}</h2>'
                     f'<p class="word">{word}</p></div></header><p class="summary">{html.escape(s["summary"])}</p>{table}{notes}</section>')
    counts = Counter(s['verdict'] for s in report.sections)
    overall = BAD if counts[BAD] else WARN if counts[WARN] else OK
    page = f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Диагност «Волны»</title><style>
:root{{--bg:#0b0b11;--card:#13131b;--line:#2a2933;--text:#f6f3fa;--muted:#9a97a4;--ok:#b9ff4b;--warn:#ffc04d;--bad:#ff6b6b;--info:#7aa7ff}}
body{{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}}
main{{max-width:980px;margin:0 auto;padding:28px 16px 60px}}h1{{margin:0 0 4px;font-size:28px}}.meta{{color:var(--muted);margin:0 0 22px}}
.overall{{display:inline-block;margin-bottom:22px;padding:6px 14px;border-radius:999px;font-weight:700;color:#111}}.overall.v-ok{{background:var(--ok)}}.overall.v-warn{{background:var(--warn)}}.overall.v-bad{{background:var(--bad)}}
.card{{margin:0 0 16px;padding:18px;border:1px solid var(--line);border-left:4px solid var(--info);border-radius:14px;background:var(--card)}}
.card.v-ok{{border-left-color:var(--ok)}}.card.v-warn{{border-left-color:var(--warn)}}.card.v-bad{{border-left-color:var(--bad)}}
header{{display:flex;gap:12px;align-items:center}}h2{{margin:0;font-size:18px}}.word{{margin:0;color:var(--muted);font-size:13px}}
.mark{{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:50%;background:#ffffff10;font-weight:800}}
.v-ok .mark{{color:var(--ok)}}.v-warn .mark{{color:var(--warn)}}.v-bad .mark{{color:var(--bad)}}.v-info .mark{{color:var(--info)}}
.summary{{margin:12px 0}}table{{width:100%;border-collapse:collapse;margin:8px 0;font-size:13px;display:block;overflow-x:auto}}
th,td{{padding:7px 10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}}th{{color:var(--muted);font-weight:600}}
td.v-ok{{color:var(--ok)}}td.v-warn{{color:var(--warn)}}td.v-bad{{color:var(--bad)}}ul{{margin:8px 0 0;padding-left:20px;color:#d8d4e0;font-size:13px}}li{{margin:3px 0}}
</style></head><body><main><h1>Диагност «Волны»</h1><p class="meta">{html.escape(report.url)} · {dt.datetime.now():%d.%m.%Y %H:%M}</p>
<div class="overall v-{overall}">{ {OK: "Всё в порядке", WARN: "Есть замечания", BAD: "Есть проблемы"}[overall] }</div>{''.join(parts)}</main></body></html>'''
    path.write_text(page, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description='Проверка сайта «Волна»: тормоза, ошибки, подбор музыки.')
    parser.add_argument('--url', default='http://192.168.88.252:18080/')
    parser.add_argument('--quick', action='store_true', help='меньше браузеров и треков')
    parser.add_argument('--tracks', type=int, default=25, help='сколько треков прогнать в волне')
    parser.add_argument('--mood', help='настроение для прогона, например Энергия')
    parser.add_argument('--genres', help='жанры через запятую, как на сайте: Рок,Инди-рок')
    parser.add_argument('--no-lab', action='store_true', help='только данные с реальных устройств')
    parser.add_argument('--no-field', action='store_true', help='без данных с сервера')
    parser.add_argument('--days', type=float, default=7, help='за сколько дней брать отчёты устройств')
    parser.add_argument('--ssh', default='vadm@192.168.88.252')
    parser.add_argument('--key', default='~/.ssh/vadm_wave')
    parser.add_argument('--out', default=str(HERE / 'reports'))
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    report = Report(args.url)
    if not args.no_lab:
        with sync_playwright() as p:
            for name, step in [('загрузка', lambda: check_load(p, report, args.url, args.quick)),
                               ('прокрутка', lambda: check_scroll(p, report, args.url)),
                               ('переключение', lambda: check_switching(p, report, args.url, 3 if args.quick else 5)),
                               ('музыка', lambda: check_music(p, report, args.url, 10 if args.quick else args.tracks, args.mood,
                                                             [g.strip() for g in args.genres.split(',')] if args.genres else None))]:
                log(f'— {name}')
                try:
                    step()
                except Exception as error:  # one broken check must not lose the rest of the report
                    report.section(f'Проверка «{name}» не выполнилась', WARN, str(error)[:300])
                    log(f'{name} failed: {error}')
    if not args.no_field:
        log('— данные с устройств')
        try:
            check_field(report, fetch_field(args.ssh, args.key, args.days), args.days)
        except Exception as error:
            report.section('Реальные устройства', INFO, f'Не удалось забрать отчёты с сервера: {error}')
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime('%Y%m%d-%H%M')
    html_path, json_path = out / f'doctor-{stamp}.html', out / f'doctor-{stamp}.json'
    render_html(report, html_path)
    json_path.write_text(json.dumps({'url': args.url, 'sections': report.sections, 'data': report.data}, ensure_ascii=False, indent=1, default=str), encoding='utf-8')
    log(f'отчёт: {html_path}')
    for s in report.sections:
        print(f"  [{s['verdict']:4}] {s['title']}: {s['summary']}")
    if not args.no_open and sys.platform == 'win32':
        os.startfile(html_path)


if __name__ == '__main__':
    main()
