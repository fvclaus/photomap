import json
import os

from django.db.models import Q
from pm.models import Photo

from .apitestcase import TEST_PHOTO, ApiTestCase


class PhotoControllerTest(ApiTestCase):
    model = Photo

    def setUp(self):
        super().setUp()
        self.url = "/photo/"
        self.insert_data = {"place": 1,
                            "title": "Chuck Norris",
                            "description": u'Some text,text,... Testing some umlauts äüö and other special characters 晚上好 <javascript></javascript>'}
        self._openphoto(self.insert_data)
        self.update_data = {"id": 1,
                            "title": "EO changed",
                            "description": "The description changed"}
        self.update_multiple_data = [{"id": 1,
                                      "title": "New title 1",
                                      "description": "The description changed",
                                      "order": 1},
                                     {"id": 2,
                                      "title": "New title 2",
                                      "order": 0}]

    def test_delete(self):
        self.assertDeletes({"id": 1})
        self.assertEqual(self.userprofile.used_space, 164375)

    def test_delete_unknown_photo(self):
        self.assertError({"id": 9999})

    def test_delete_foreign_photo(self):
        self.assertError({"id": 100})

    def test_delete_foreign_photo2(self):
        self.assert404("/photo/abc/", method="DELETE")

    def test_insert(self):
        used_space_before = self.userprofile.used_space
        (photo, content) = self.assertCreates(self.insert_data)
        self.assertEqual(photo.title, self.insert_data["title"])
        self.assertEqual(photo.description, self.insert_data["description"])
        self.assertEqual(photo.order, 0)
        self.assertEqual(content["order"], 0)
        self.assertTrue(photo.size < self._get_photo_size())
        # Photo gets resized and compressed. Size must be smaller than photo size
        self.assertTrue(self.userprofile.used_space <=
                        used_space_before + self._get_photo_size())

    def test_insert_over_quota(self):
        userprofile = self.userprofile
        userprofile.used_space = userprofile.quota - 20
        userprofile.save()
        self.assertError(self.insert_data)

    def test_insert_invalid_photo_missing_photo(self):
        del self.insert_data["photo"]
        self.assertError(self.insert_data)

    def test_insert_invalid_photo_missing_title(self):
        del self.insert_data["title"]
        self.assertError(self.insert_data)

    def test_insert_foreign_place(self):
        self.insert_data["place"] = 2
        self.assertError(self.insert_data)

    def test_update(self):
        (photo, content) = self.assertUpdates(self.update_data)
        self.assertEqual(photo.title, self.update_data["title"])
        self.assertEqual(photo.description, self.update_data["description"])

    def test_update_foreign_photo(self):
        self.update_data["id"] = 100
        self.assertError(self.update_data)

    def test_update_unknown_place(self):
        self.update_data["id"] = 999  # does not exist
        self.assertError(self.update_data)

    def test_update_unknown_place2(self):
        self.assert404("/photo/abc/", method="POST")

    def test_update_multiple(self):
        self.url = "/photos"
        self.assertSuccess(
            self.url, {"photos": json.dumps(self.update_multiple_data)})
        photos = Photo.objects.filter(
            Q(pk=1) | Q(pk=2)
        )
        self.assertEqual(
            photos[0].title, self.update_multiple_data[0]["title"])
        self.assertEqual(
            photos[0].order, self.update_multiple_data[0]["order"])
        self.assertEqual(photos[0].description,
                         self.update_multiple_data[0]["description"])
        self.assertEqual(
            photos[1].title, self.update_multiple_data[1]["title"])
        self.assertEqual(
            photos[1].order, self.update_multiple_data[1]["order"])

    def update_multiple_foreign_photo(self):
        self.update_multiple_data[0]["id"] = 100
        self.assertError({"photos": json.dumps(self.update_multiple_data)})
        photo = Photo.objects.get(pk=1)
        # Make sure photos are unchanged.
        self.assertEqual(photo.title, "First photo of first place")

    def update_multiple_invalid_photo(self):
        self.update_multiple_data[0]["id"] = 999  # does not exist
        self.assertError({"photos": json.dumps(self.update_multiple_data)})

    def update_multiple_invalid_json(self):
        self.assertError({"photos": "This is {aa; not Js0n"})

    def _openphoto(self, data):
        photo = open(TEST_PHOTO, "rb")
        data["photo"] = photo

    def _get_photo_size(self):
        return os.stat(TEST_PHOTO).st_size
