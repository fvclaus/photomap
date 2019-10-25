# -*- coding: utf-8 -*-

import operator
from decimal import Decimal
from functools import reduce

from django.db.models import Q
from pm.models import Album, Photo, Place

from .apitestcase import ApiTestCase


class AlbumViewTest(ApiTestCase):

    model = Album

    def setUp(self):
        super().setUp()
        self.url = "/album/"
        self.insert_data = {"title": "Atlantis",
                            "lat": Decimal("17.375803"),
                            "lon": Decimal("-34.628906"),
                            "description": u'Some text,text,... Testing some umlauts üäß and other special characters <javascript></javascript>'}
        self.update_data = {"id": 1,
                            "title": "EO changed",
                            "description": "The description changed"}

    def test_delete(self):
        album = Album.objects.get(pk=1)
        places = Place.objects.filter(album=album)
        photos = Photo.objects.filter(
            reduce(operator.or_, map(lambda place: Q(place=place), places)))

        self.assertDeletes({"id": 1})

        for place in places:
            self.assertDoesNotExist(place.pk, model=Place)

        for photo in photos:
            self.assertDoesNotExist(photo.pk, model=Photo)

        self.assertEqual(self.user.userprofile.used_space, 162806)

    def test_delete_unknown_album(self):
        self.assertError({"id": 9999})

    def test_delete_unknown_album2(self):
        self.assert404("/album/abc/", method="DELETE")

    def test_delete_foreign_album(self):
        self.assertError({"id": 2})

    def test_insert(self):
        # =======================================================================
        # 'ocean test'
        # =======================================================================
        (album, content) = self.assertCreates(self.insert_data)
        self.assertTrue(album.secret is not None)
        self.assertTrue(content["id"])
        self.assertTrue(content["secret"])
        self.assertEqual(album.title, self.insert_data["title"])
        self.assertEqual(album.description, self.insert_data["description"])

    def test_insert_invalid_album_invalid_lat(self):
        self.insert_data["lat"] = Decimal(1.23123)
        self.assertError(self.insert_data)

    def test_insert_invalid_album_missing_lat(self):
        del self.insert_data["lat"]
        self.assertError(self.insert_data)

    def test_update(self):
        (album, content) = self.assertUpdates(self.update_data)
        self.assertEqual(album.title, self.update_data["title"])
        self.assertEqual(album.description, self.update_data["description"])

    def test_update_unknown_album(self):
        self.update_data["id"] = 999  # does not exist
        self.assertError(self.update_data)

    def test_update_foreign_album(self):
        self.update_data["id"] = 2
        self.assertError(self.update_data)

    def test_update_foreign_album2(self):
        self.assert404("/album/abc/", method="POST")

    def test_update_password(self):
        self.url = "/album/1/password"
        data = {"password": "blah"}
        self.assertSuccess(self.url, data)
        album = Album.objects.get(pk=1)
        from django.contrib.auth import hashers
        self.assertTrue(hashers.is_password_usable(album.password))

    def test_get(self):
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

    def test_get_unknown_album(self):
        self.assertError({"id": "999"}, method="GET")

    def test_get_foreign_album(self):
        self.assertError({"id": 2}, method="GET")

    def test_get_foreign_album2(self):
        self.assert404("/album/abc/", method="GET")

    def test_get_shared_album(self):
        # TODO Implement test for shared album
        pass

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
