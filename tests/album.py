# -*- coding: utf-8 -*-

from copy import deepcopy
from decimal import Decimal

from pm.models import Album, Photo, Place

from .apitestcase import ApiTestCase
from .data import GPS_MANNHEIM_SCHLOSS


class AlbumControllerTest(ApiTestCase):

    model = Album

    def test_delete(self):
        # =======================================================================
        # define url for requests
        # =======================================================================
        self.url = "/album/"
        # =======================================================================
        # delete something that exists
        # =======================================================================
        album = Album.objects.get(pk=1)
        places = [place.pk for place in Place.objects.all().filter(album=album)]
        photos = []

        for place in places:
            photos.extend(
                [photo for photo in Photo.objects.all().filter(place=place)])

        self.assertDeletes({"id": 1})

        for place in places:
            self.assertDoesNotExist(place, model=Place)

        for photo in photos:
            self.assertDoesNotExist(photo, model=Photo)

        self.assertEqual(self.user.userprofile.used_space, 0)

        # =======================================================================
        # delete something that does not exist
        # =======================================================================
        self.assertError({"id": 9999})
        # =======================================================================
        # delete something that does not belong to you
        # =======================================================================
        self.assertError({"id": 2})
        # =======================================================================
        # use wrong paramater
        # =======================================================================
        self.assert404("/album/abc/", method="DELETE")

    def test_insert(self):
        self.url = "/album/"
        # =======================================================================
        # 'ocean test'
        # =======================================================================
        data = {"title": "Atlantis",
                "lat": Decimal("17.375803"),
                "lon": Decimal("-34.628906")}
        (album, content) = self.assertCreates(data)
        self.assertTrue(album.secret is not None)
        #self.assertEqual(album.country, "oc")
        # OSM geocoding has been disabled for the moment.
        self.assertTrue(content["id"])
        self.assertTrue(content["secret"])
        # =======================================================================
        # insert something valid without description
        # =======================================================================
        data = {"title": "Mannheim",
                "lat": GPS_MANNHEIM_SCHLOSS["lat"],
                "lon": GPS_MANNHEIM_SCHLOSS["lon"]}
        (album, content) = self.assertCreates(data)
        self.assertTrue(album.secret != None)
        self.assertEqual(album.title, data["title"])
        #self.assertEqual(album.country, "de")
        # OSM geocoding has been disabled for the moment.
        # =======================================================================
        # insert something valid with description
        # =======================================================================
        data["description"] = u'Some text,text,... Testing some umlauts üäß and other special characters <javascript></javascript>'
        (album, content) = self.assertCreates(data)
        self.assertEqual(album.description, data["description"])
        # =======================================================================
        # Too many decimal places for coordinates
        # =======================================================================
        data["lat"] = Decimal(1.23123)
        self.assertError(data)
        # =======================================================================
        # insert somthing that is not valid
        # =======================================================================
        data2 = deepcopy(data)
        del data2["lat"]
        self.assertError(data2)
        # =======================================================================
        # delete some more
        # =======================================================================
        data3 = deepcopy(data)
        del data3["lon"]
        self.assertError(data3)

    def test_update(self):
        self.url = "/album/"
        # =======================================================================
        # test something valid without description
        # =======================================================================
        data = {"id": 1,
                "title": "EO changed"}
        (album, content) = self.assertUpdates(data)
        self.assertEqual(album.title, data["title"])
        # =======================================================================
        # with description
        # =======================================================================
        data["description"] = "The description changed"
        (album, content) = self.assertUpdates(data)
        self.assertEqual(album.description, data["description"])
        # =======================================================================
        # Wrong id test
        # =======================================================================
        data["id"] = 999  # does not exist
        self.assertError(data)
        # =======================================================================
        # Not owner
        # =======================================================================
        data["id"] = 2
        self.assertError(data)
        # =======================================================================
        # Wrong parameter
        # =======================================================================
        self.assert404("/album/abc/", method="POST")

    def test_update_password(self):
        self.url = "/album/1/password"
        data = {"password": "blah"}
        self.assertSuccess(self.url, data)
        album = Album.objects.get(pk=1)
        from django.contrib.auth import hashers
        self.assertTrue(hashers.is_password_usable(album.password))

    def test_get(self):
        self.url = "/album/"
#        data = {"id" : 1}
        album = self.json(self.url + "1/", method="GET")
        self.assertAlbumComplete(album)
        self.assertTrue(album["places"])
        places = album["places"]
        for place in places:
            self.assertPlaceComplete(place)
            photos = place["photos"]

            for photo in photos:
                self.assertPhotoComplete(photo)
                self.assertTrue(photo["description"] is None)

        # =======================================================================
        # Something invalid
        # =======================================================================
        self.url = "/album/999/"
        self.assertError(method="GET")
        # =======================================================================
        # Not owner
        # =======================================================================
        self.url = "/album/2/"
        self.assertError(method="GET")
        # =======================================================================
        # Wrong parameter.
        # =======================================================================
        self.assert404("/album/abc/", method="GET")

#    def test_share(self):
#        self.url = "/get-album-share"
#        response = self.json(method = "GET", data = {"id":1})
#        self.assertTrue(response["success"])
#        self.assertRegexpMatches(response["url"], "\/view-album\?id=\d+&secret=.*")
#        secret = re.search("secret=(?P<secret>.*)", response["url"]).group("secret")
#        self.assertPublicAccess("/get-album?id=%d&secret=%s" % (1, secret))
#        # assert that exactly one token is generated
#        response2 = self.json(method = "GET", data = {"id":1})
#        self.assertEqual(response["url"], response2["url"])
#        # =======================================================================
#        # does not belong to you
#        # =======================================================================
#        self.assertError({"id":2}, method = "GET")
#        self.assertNoPublicAccess("/get-album?id=2")
#        self.assertNoPublicAccess("/get-album?id=2&secret=asdfs823420D")