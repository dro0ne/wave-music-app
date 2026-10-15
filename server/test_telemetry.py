import json
import unittest
import urllib.error
import urllib.request

import api
from test_api import serve


class TelemetryTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        api.cache = api.Cache(':memory:')
        cls.server = serve(api.Handler)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        api.telemetry = api.Telemetry(':memory:')

    def post(self, body, ip='10.0.0.5', raw=None):
        data = raw if raw is not None else json.dumps(body).encode()
        request = urllib.request.Request(f'http://127.0.0.1:{self.server.server_port}/api/telemetry', data=data, method='POST',
                                         headers={'Content-Type': 'application/json', 'X-Real-IP': ip})
        try:
            with urllib.request.urlopen(request) as response:
                return response.status
        except urllib.error.HTTPError as error:
            return error.code

    def test_batch_is_stored_without_the_client_address(self):
        status = self.post({'device': 'abc', 'context': {'mood': 'Энергия'}, 'events': [{'kind': 'play', 'track': {'id': 'x'}}, {'kind': 'longtasks', 'count': 3}]})
        self.assertEqual(status, 204)
        rows = api.telemetry.db.execute('SELECT device, kind, data, context FROM events').fetchall()
        self.assertEqual([r[1] for r in rows], ['play', 'longtasks'])
        self.assertNotIn('10.0.0.5', json.dumps(rows))

    def test_oversized_and_broken_batches_are_refused(self):
        self.assertEqual(self.post(None, raw=b'x' * (70 * 1024)), 413)
        self.assertEqual(self.post(None, raw=b'{not json'), 400)
        self.assertEqual(self.post({'events': 'nope'}), 400)

    def test_flooding_is_rate_limited(self):
        statuses = [self.post({'events': [{'kind': 'fps'}]}, ip='10.7.7.7') for _ in range(api.Telemetry.PER_WINDOW + 2)]
        self.assertEqual(statuses[-1], 429)
        self.assertEqual(self.post({'events': [{'kind': 'fps'}]}, ip='10.8.8.8'), 204)

    def test_reports_cannot_be_read_over_http(self):
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{self.server.server_port}/api/telemetry') as response:
                status = response.status
        except urllib.error.HTTPError as error:
            status = error.code
        self.assertEqual(status, 404)


if __name__ == '__main__':
    unittest.main()
