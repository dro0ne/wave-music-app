import json
import threading
import time
import unittest
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import api


class FakeUpstream(BaseHTTPRequestHandler):
    calls = []
    mode = 'json'

    def do_GET(self):
        FakeUpstream.calls.append(self.path)
        if FakeUpstream.mode == 'down':
            self.send_response(503)
            self.end_headers()
            return
        body = b'<html>oops</html>' if FakeUpstream.mode == 'html' else json.dumps({'data': [{'path': self.path}]}).encode()
        self.send_response(200)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def serve(handler):
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


class ApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.upstream = serve(FakeUpstream)
        base = f'http://127.0.0.1:{cls.upstream.server_port}'
        api.AUDIUS_API = base + '/v1'
        api.JAMENDO_API = base + '/v3.0'
        cls.api = serve(api.Handler)

    @classmethod
    def tearDownClass(cls):
        cls.api.shutdown()
        cls.upstream.shutdown()

    def setUp(self):
        api.cache = api.Cache(':memory:')
        api.JAMENDO_CLIENT_ID = ''
        FakeUpstream.calls = []
        FakeUpstream.mode = 'json'

    def get(self, path):
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{self.api.server_port}{path}') as response:
                return response.status, response.headers.get('X-Cache'), json.loads(response.read())
        except urllib.error.HTTPError as error:
            return error.code, error.headers.get('X-Cache'), json.loads(error.read())

    def test_second_request_is_served_from_cache(self):
        first = self.get('/api/audius/v1/tracks/search?query=rock&genre=Rock&limit=5')
        second = self.get('/api/audius/v1/tracks/search?limit=5&genre=Rock&query=rock')
        self.assertEqual((first[0], first[1]), (200, 'MISS'))
        self.assertEqual((second[0], second[1]), (200, 'HIT'))
        self.assertEqual(len(FakeUpstream.calls), 1)
        self.assertEqual(first[2], second[2])

    def test_repeated_and_blank_params_reach_upstream(self):
        self.get('/api/audius/v1/tracks/search?query=&mood=Romantic&mood=Sensual&limit=5')
        self.assertIn('query=&', FakeUpstream.calls[0])
        self.assertIn('mood=Romantic&mood=Sensual', FakeUpstream.calls[0])

    def test_stale_answer_survives_upstream_outage(self):
        self.get('/api/audius/v1/tracks/trending?limit=5')
        key = '/api/audius/v1/tracks/trending?limit=5'
        body, _ = api.cache.get(key)
        with api.cache.lock:
            api.cache.db.execute('UPDATE cache SET fetched=? WHERE key=?', (time.time() - 2 * api.HOUR, key))
        FakeUpstream.mode = 'down'
        status, state, data = self.get('/api/audius/v1/tracks/trending?limit=5')
        self.assertEqual((status, state), (200, 'STALE'))
        self.assertEqual(json.dumps(data).encode(), json.dumps(json.loads(body)).encode())

    def test_outage_without_cache_is_an_error(self):
        FakeUpstream.mode = 'down'
        self.assertEqual(self.get('/api/audius/v1/tracks/latest?limit=5')[0], 502)

    def test_non_json_upstream_answer_is_not_cached(self):
        FakeUpstream.mode = 'html'
        self.assertEqual(self.get('/api/audius/v1/tracks/latest?limit=5')[0], 502)
        self.assertEqual(api.cache.count(), 0)

    def test_only_catalog_reads_are_proxied(self):
        for path in ['/api/audius/v1/tracks/123/stream?no_redirect=true', '/api/audius/v1/users/1', '/api/../etc/passwd', '/index.html']:
            self.assertEqual(self.get(path)[0], 404, path)
        self.assertEqual(FakeUpstream.calls, [])

    def test_jamendo_needs_a_server_key_and_hides_it(self):
        self.assertEqual(self.get('/api/jamendo/tracks?search=rock&client_id=evil')[0], 503)
        api.JAMENDO_CLIENT_ID = 'secret-id'
        self.assertEqual(self.get('/api/jamendo/tracks?search=rock&client_id=evil')[0], 200)
        self.assertIn('client_id=secret-id', FakeUpstream.calls[0])
        self.assertNotIn('evil', FakeUpstream.calls[0])
        self.assertNotIn('secret-id', ''.join(k for (k,) in api.cache.db.execute('SELECT key FROM cache')))

    def test_health_reports_sources(self):
        status, _, data = self.get('/api/health')
        self.assertEqual((status, data['ok'], data['jamendo']), (200, True, False))


if __name__ == '__main__':
    unittest.main()
