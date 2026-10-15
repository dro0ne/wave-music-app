import json
import os
import tempfile
import unittest
import urllib.request

import api
import library
from test_api import serve


class HarvesterTest(unittest.TestCase):
    def test_license_names(self):
        self.assertEqual(library.license_name('http://creativecommons.org/licenses/by-nc-sa/3.0/'), 'CC BY-NC-SA 3.0')
        self.assertEqual(library.license_name('https://creativecommons.org/publicdomain/zero/1.0/'), 'CC0')
        self.assertIsNone(library.license_name('http://example.com/all-rights-reserved'))

    def test_lengths(self):
        self.assertEqual(library.seconds('4:05'), 245)
        self.assertEqual(library.seconds('245.5'), 245.5)
        self.assertIsNone(library.seconds('n/a'))

    def test_picks_song_length_originals_once(self):
        files = [
            {'name': '01-intro.mp3', 'source': 'original', 'length': '0:40', 'size': '600000'},
            {'name': '02-song.mp3', 'source': 'original', 'length': '3:30', 'size': '5000000'},
            {'name': '02-song_64kb.mp3', 'source': 'derivative', 'length': '3:30', 'size': '1600000'},
            {'name': '03-mix.mp3', 'source': 'original', 'length': '58:00', 'size': '29000000'},
            {'name': '04-track.mp3', 'source': 'original', 'length': '250', 'size': '6000000'},
            {'name': 'cover.jpg', 'source': 'original'},
        ]
        names = [f['name'] for f, _, _ in library.pick_tracks({'files': files})]
        self.assertEqual(names, ['02-song.mp3', '04-track.mp3'])


class LibraryApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        api.LIB_DB = os.path.join(cls.tmp.name, 'library.db')
        db = library.open_db(api.LIB_DB)
        rows = [('ia:a/1.mp3', 'Night Drive', 'Neon', 'Synth Album', 'electronic,synthwave', 200, 900, 'CC BY 3.0', 'https://archive.org/details/a', 'art', 'ia/a/1.mp3', 5, 1),
                ('ia:b/2.mp3', 'Slow River', 'Folkers', 'Water', 'folk,acoustic', 180, 50, 'CC BY-SA 4.0', 'https://archive.org/details/b', 'art', 'ia/b/2 x.mp3', 5, 2),
                ('ia:c/3.mp3', 'Glass', 'Quiet', 'Postrock Days', 'postrock,ambient', 300, 300, 'CC0', 'https://archive.org/details/c', 'art', 'ia/c/3.mp3', 5, 3)]
        db.executemany('INSERT INTO tracks VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', rows)
        db.commit()
        db.close()
        api.cache = api.Cache(':memory:')
        cls.server = serve(api.Handler)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.tmp.cleanup()

    def get(self, path):
        with urllib.request.urlopen(f'http://127.0.0.1:{self.server.server_port}{path}') as response:
            return json.loads(response.read())

    def test_terms_match_tags_including_compact_spelling(self):
        titles = [t['title'] for t in self.get('/api/library/tracks?terms=post%20rock')['data']]
        self.assertEqual(titles, ['Glass'])

    def test_popular_order_and_stream_path(self):
        data = self.get('/api/library/tracks?limit=10')['data']
        self.assertEqual([t['title'] for t in data], ['Night Drive', 'Glass', 'Slow River'])
        self.assertEqual(data[2]['stream'], 'media/ia/b/2%20x.mp3')
        self.assertNotIn('file', data[0])

    def test_any_of_several_terms(self):
        titles = {t['title'] for t in self.get('/api/library/tracks?terms=folk|synthwave')['data']}
        self.assertEqual(titles, {'Night Drive', 'Slow River'})

    def test_health_counts_library(self):
        self.assertEqual(self.get('/api/health')['library'], 3)


if __name__ == '__main__':
    unittest.main()
