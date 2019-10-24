
from pm.models import Photo, Place

from .apitestcase import GPS_MANNHEIM_SCHLOSS, ApiTestCase


class PlaceControllerTest(ApiTestCase):
    model = Place

    def setUp(self):
        super().setUp()
        self.url = "/place/"
        self.insert_data = {"album": 1,
                            "lat": GPS_MANNHEIM_SCHLOSS["lat"],
                            "lon": GPS_MANNHEIM_SCHLOSS["lon"],
                            "description": "Some description, blah, blah...",
                            "title": "Next to EO"}
        self.update_data = {"id": 1,
                            "title": "Some other title",
                            "description": "Some other description"}

    def test_insert(self):
        (place, content) = self.assertCreates(self.insert_data)
        self.assertEqual(place.title, self.insert_data["title"])
        self.assertEqual(place.description, self.insert_data["description"])

    def test_insert_foreign_album(self):
        self.insert_data["album"] = 2
        self.assertError(self.insert_data)

    def test_insert_invalid_place_missing_lat(self):
        del self.insert_data["lat"]
        self.assertError(self.insert_data)

    def test_insert_invalid_place_missing_lon(self):
        del self.insert_data["lon"]
        self.assertError(self.insert_data)

    def test_update(self):
        (place, content) = self.assertUpdates(self.update_data)
        self.assertEqual(place.title, self.update_data["title"])
        self.assertEqual(place.description, self.update_data["description"])

    def update_foreign_place(self):
        self.update_data["id"] = 2
        self.assertError(self.update_data)

    def update_place_with_invalid_data(self):
        self.update_data["id"] = 9999
        self.assertError(self.update_data)

    def update_unknown_place(self):
        self.assert404("/place/abc/", method="POST")

    def test_delete(self):
        place = Place.objects.get(pk=1)
        photos = Photo.objects.filter(place=place)
        self.assertDeletes({"id": place.pk})
        for photo in photos:
            self.assertDoesNotExist(photo, model=Photo)
        self.assertEqual(self.user.userprofile.used_space, 163852)

    def test_delete_foreign_place(self):
        self.assertError({"id": 2})

    def test_invalid_place(self):
        self.assertError({"id": 9999})

    def test_invalid_place2(self):
        self.assert404("/place/abc/", method="DELETE")
