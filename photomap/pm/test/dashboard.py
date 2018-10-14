'''
Created on Jul 27, 2012

@author: fredo
'''

from apitestcase import ApiTestCase

class DashboardControllerTest(ApiTestCase):

    def test_get(self):
        self.url = "/albums"
        albums = self.json(self.url, method = "GET")
        self.assertEqual(len(albums), 1)
        for album in albums:
            self.assertAlbumComplete(album)
            self.assertRaises(KeyError, album.__getitem__, "photos")
        # =======================================================================
        # send some crap
        # =======================================================================
        albums2 = self.json(self.url, {"id" : 2}, method = "GET")
        self.assertEqual(albums[0]["id"], albums2[0]["id"])
        # =======================================================================
        # not logged in
        # =======================================================================
        self.assertLoginRequired(self.url, method = "GET")

