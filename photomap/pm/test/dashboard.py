'''
Created on Jul 27, 2012

@author: fredo
'''

from simpletestcase import SimpleTestCase

class DashboardControllerTest(SimpleTestCase):
    

    def test_get(self):
        self.url = "/get-all-albums"
        albums = self.json( method = "GET")
        self.assertEqual(len(albums),1)
        for album in albums:
            self.assertAlbumComplete(album)
            self.assertRaises(KeyError, album.__getitem__,"photos")
        #=======================================================================
        # send some crap
        #=======================================================================
        albums2 = self.json({"id" : 2},method = "GET")
        #=======================================================================
        # not logged in
        #=======================================================================
        albums3 = self.json(method="GET",loggedin = False)
        for album in albums3:
            self.assertTrue(album["lat"])
            self.assertTrue(album["lon"])
            self.assertFalse(album["isOwner"])
            self.assertTrue(album["country"])
            self.assertRaises(KeyError, album.__getitem__,"photos")