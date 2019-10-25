from .apitestcase import ApiTestCase


class DashboardViewTest(ApiTestCase):

    def setUp(self):
        super().setUp()
        self.url = "/albums"

    def test_get(self):
        albums = self.json(self.url, method="GET")
        self.assertEqual(len(albums), 1)
        for album in albums:
            self.assertAlbumComplete(album)
            self.assertRaises(KeyError, album.__getitem__, "photos")

    def test_get_without_login(self):
        self.assertLoginRequired(self.url, method="GET")
