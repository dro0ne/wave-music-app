import unittest
from unittest import mock

import importers
from importers import PlaylistImportError, import_url, parse_text


def fake_fetch(pages):
    def fetch(url, accept_json=True, language=None):
        if url not in pages:
            raise AssertionError(f'unexpected request {url}')
        return pages[url], url
    return fetch


YANDEX_TRACK = {'track': {'title': 'Кукла колдуна', 'artists': [{'name': 'Король и Шут'}], 'albums': [{'genre': 'rusrock', 'year': 1998, 'title': 'Акустический альбом'}]}}


class UrlImportTest(unittest.TestCase):
    def test_yandex_public_playlist(self):
        pages = {'https://api.music.yandex.net/playlist/lk.65568309-77fe-40fa-9838-1aad8c6134e0': {'result': {
            'title': 'Мне нравится', 'visibility': 'public', 'available': True,
            'tracks': [YANDEX_TRACK, {'track': {'title': 'Sahara', 'artists': [{'name': 'Hensonn'}], 'albums': [{'genre': 'phonkgenre'}]}}]}}}
        with mock.patch.object(importers, 'fetch', fake_fetch(pages)):
            result = import_url('https://music.yandex.ru/playlists/lk.65568309-77fe-40fa-9838-1aad8c6134e0?utm_source=share')
        self.assertEqual(result['service'], 'yandex')
        self.assertEqual(result['count'], 2)
        self.assertEqual(result['tracks'][0], {'artists': ['Король и Шут'], 'title': 'Кукла колдуна', 'genre': 'russian rock', 'year': 1998, 'album': 'Акустический альбом'})
        self.assertEqual(result['tracks'][1]['genre'], 'phonk')

    def test_yandex_user_playlist_and_private(self):
        pages = {'https://api.music.yandex.net/users/drone589/playlists/3': {'result': {'visibility': 'private', 'tracks': []}}}
        with mock.patch.object(importers, 'fetch', fake_fetch(pages)):
            with self.assertRaises(PlaylistImportError) as caught:
                import_url('music.yandex.ru/users/drone589/playlists/3')
        self.assertEqual(caught.exception.code, 'private')

    def test_deezer_playlist_pages_and_album_genres(self):
        host = 'https://api.deezer.com'
        pages = {
            f'{host}/playlist/42': {'title': 'Mix'},
            f'{host}/playlist/42/tracks?limit=100': {'data': [{'title': 'Numb', 'artist': {'name': 'Linkin Park'}, 'album': {'id': 7, 'title': 'Meteora'}}], 'next': f'{host}/playlist/42/tracks?limit=100&index=100'},
            f'{host}/playlist/42/tracks?limit=100&index=100': {'data': [{'title_short': 'Faint', 'title': 'Faint (Live)', 'artist': {'name': 'Linkin Park'}, 'album': {'id': 7}}]},
            f'{host}/album/7': {'genres': {'data': [{'name': 'Rock'}, {'name': 'Alternative'}]}},
        }
        with mock.patch.object(importers, 'fetch', fake_fetch(pages)):
            result = import_url('https://www.deezer.com/ru/playlist/42')
        self.assertEqual([t['title'] for t in result['tracks']], ['Numb', 'Faint'])
        self.assertEqual(result['tracks'][0]['genre'], 'rock, alternative')
        self.assertEqual(result['topArtists'][0], ['Linkin Park', 2])

    def test_deezer_never_follows_foreign_next_links(self):
        host = 'https://api.deezer.com'
        pages = {f'{host}/playlist/1': {'title': 'x'}, f'{host}/playlist/1/tracks?limit=100': {'data': [{'title': 'a', 'artist': {'name': 'b'}, 'album': {}}], 'next': 'http://169.254.169.254/'}}
        with mock.patch.object(importers, 'fetch', fake_fetch(pages)):
            self.assertEqual(import_url('deezer.com/playlist/1')['count'], 1)

    def test_apple_music_page(self):
        html = ('<title>‎Hits - Playlist - Apple Music</title><script type="application/json" id="serialized-server-data">'
                '[{"data":{"sections":[{"items":[{"title":"expectations","artistName":"Olivia Rodrigo & Chappell Roan"}]}]}}]</script>')
        pages = {'https://music.apple.com/us/playlist/hits/pl.abc123': html}
        with mock.patch.object(importers, 'fetch', fake_fetch(pages)):
            result = import_url('https://music.apple.com/us/playlist/hits/pl.abc123')
        self.assertEqual(result['tracks'][0]['artists'], ['Olivia Rodrigo', 'Chappell Roan'])
        self.assertTrue(result['partial'])
        self.assertEqual(result['title'], 'Hits')

    def test_unsupported_and_foreign_hosts_are_never_fetched(self):
        with mock.patch.object(importers, 'fetch', side_effect=AssertionError('no requests')):
            for url, code in [('https://open.spotify.com/playlist/x', 'unsupported'), ('http://192.168.88.252:18080/', 'unsupported'),
                              ('file:///etc/passwd', 'bad_link'), ('https://music.yandex.ru/artist/1', 'bad_link')]:
                with self.assertRaises(PlaylistImportError) as caught:
                    import_url(url)
                self.assertEqual(caught.exception.code, code, url)


class TextImportTest(unittest.TestCase):
    def test_pasted_lines(self):
        result = parse_text('1. Баста - Сансара 4:12\nLinkin Park — Numb\nnot a track\nKordhell – Murder In My Mind (3:05)\n')
        self.assertEqual([(t['artists'], t['title']) for t in result['tracks']],
                         [(['Баста'], 'Сансара'), (['Linkin Park'], 'Numb'), (['Kordhell'], 'Murder In My Mind')])

    def test_exportify_csv_with_genres(self):
        text = ('﻿"Track URI","Track Name","Artist Name(s)","Album Name","Release Date","Genres"\n'
                '"spotify:track:1","Numb","Linkin Park","Meteora","2003-03-25","alternative metal,nu metal"\n')
        track = parse_text(text)['tracks'][0]
        self.assertEqual(track, {'artists': ['Linkin Park'], 'title': 'Numb', 'genre': 'alternative metal,nu metal', 'year': 2003, 'album': 'Meteora'})

    def test_empty_list_explains_format(self):
        with self.assertRaises(PlaylistImportError) as caught:
            parse_text('hello\nworld')
        self.assertEqual(caught.exception.status, 422)


if __name__ == '__main__':
    unittest.main()
