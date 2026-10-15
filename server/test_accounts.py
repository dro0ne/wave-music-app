import base64
import json
import unittest
import urllib.error
import urllib.request

import accounts as accounts_module
import api
from test_api import serve

accounts_module.ITERATIONS = 1000  # keeps the suite fast; production uses the full count


class AccountsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        api.cache = api.Cache(':memory:')
        cls.server = serve(api.Handler)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        api.accounts = accounts_module.Accounts(':memory:')

    def call(self, method, path, body=None, token=None, ip='10.0.0.1'):
        data = json.dumps(body).encode() if body is not None else None
        request = urllib.request.Request(f'http://127.0.0.1:{self.server.server_port}{path}', data=data, method=method,
                                         headers={'Content-Type': 'application/json', 'X-Real-IP': ip, **({'Authorization': f'Bearer {token}'} if token else {})})
        try:
            with urllib.request.urlopen(request) as response:
                return response.status, json.loads(response.read())
        except urllib.error.HTTPError as error:
            return error.code, json.loads(error.read())

    def register(self, name='Гриша', password='secret1'):
        return self.call('POST', '/api/account/register', {'name': name, 'password': password})

    def test_register_and_name_is_unique_ignoring_case(self):
        status, data = self.register()
        self.assertEqual(status, 200)
        self.assertTrue(data['token'])
        self.assertEqual(data['profile']['name'], 'Гриша')
        self.assertEqual(self.register('гриша')[0], 409)

    def test_bad_names_and_passwords_are_refused(self):
        self.assertEqual(self.register('x')[0], 400)
        self.assertEqual(self.register('<script>')[0], 400)
        self.assertEqual(self.register('Норм', '123')[0], 400)

    def test_login_checks_the_password_and_returns_saved_state(self):
        token = self.register()[1]['token']
        self.call('PUT', '/api/account/state', {'state': {'likes': [{'id': 'a'}], 'mood': 'Энергия'}}, token)
        self.assertEqual(self.call('POST', '/api/account/login', {'name': 'гриша', 'password': 'wrong!!'})[0], 401)
        status, data = self.call('POST', '/api/account/login', {'name': ' Гриша ', 'password': 'secret1'})
        self.assertEqual(status, 200)
        self.assertEqual(data['state']['mood'], 'Энергия')
        self.assertNotEqual(data['token'], token)

    def test_state_and_profile_belong_to_their_owner(self):
        a = self.register('Аня')[1]['token']
        b = self.register('Боря')[1]['token']
        self.call('PUT', '/api/account/state', {'state': {'likes': ['a']}}, a)
        self.call('PUT', '/api/account/state', {'state': {'likes': ['b']}}, b)
        self.assertEqual(self.call('GET', '/api/account/me', token=a)[1]['state']['likes'], ['a'])
        self.assertEqual(self.call('GET', '/api/account/me', token=b)[1]['state']['likes'], ['b'])
        self.assertEqual(self.call('GET', '/api/account/me')[0], 401)
        self.assertEqual(self.call('GET', '/api/account/me', token='forged')[0], 401)

    def test_profile_name_and_avatar(self):
        token = self.register()[1]['token']
        avatar = 'data:image/jpeg;base64,' + base64.b64encode(b'\xff\xd8\xff' + b'0' * 100).decode()
        status, data = self.call('PUT', '/api/account/profile', {'name': 'Гриша 2', 'avatar': avatar, 'color': '#b9ff4b'}, token)
        self.assertEqual(status, 200)
        self.assertEqual(data['profile'], {'name': 'Гриша 2', 'avatar': avatar, 'color': '#b9ff4b'})
        self.assertEqual(self.call('PUT', '/api/account/profile', {'avatar': 'javascript:alert(1)'}, token)[0], 400)
        self.assertEqual(self.call('PUT', '/api/account/profile', {'avatar': 'data:image/svg+xml;base64,PHN2Zz4='}, token)[0], 400)
        self.register('Занят')
        self.assertEqual(self.call('PUT', '/api/account/profile', {'name': 'занят'}, token)[0], 409)

    def test_logout_ends_the_session(self):
        token = self.register()[1]['token']
        self.call('POST', '/api/account/logout', {}, token)
        self.assertEqual(self.call('GET', '/api/account/me', token=token)[0], 401)

    def test_repeated_failed_logins_are_blocked(self):
        self.register()
        for _ in range(accounts_module.FAILS_ALLOWED):
            self.call('POST', '/api/account/login', {'name': 'Гриша', 'password': 'nope!!'}, ip='10.9.9.9')
        self.assertEqual(self.call('POST', '/api/account/login', {'name': 'Гриша', 'password': 'secret1'}, ip='10.9.9.9')[0], 429)
        self.assertEqual(self.call('POST', '/api/account/login', {'name': 'Гриша', 'password': 'secret1'}, ip='10.1.1.1')[0], 200)

    def test_passwords_and_tokens_are_not_stored_in_clear(self):
        token = self.register(password='topsecret')[1]['token']
        dump = '\n'.join(str(row) for table in ('users', 'sessions') for row in api.accounts.db.execute(f'SELECT * FROM {table}'))
        self.assertNotIn('topsecret', dump)
        self.assertNotIn(token, dump)

    def test_oversized_state_is_refused(self):
        token = self.register()[1]['token']
        self.assertEqual(self.call('PUT', '/api/account/state', {'state': {'x': 'a' * 1_600_000}}, token)[0], 413)


if __name__ == '__main__':
    unittest.main()
