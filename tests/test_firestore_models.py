"""
Integration tests for Firestore-backed models.
Requires the Firestore emulator to be running:
  FIRESTORE_EMULATOR_HOST=localhost:8080

These tests are skipped when the emulator is not available.
"""

import os
import unittest
from decimal import Decimal

EMULATOR_HOST = os.environ.get("FIRESTORE_EMULATOR_HOST")


@unittest.skipUnless(EMULATOR_HOST, "Firestore emulator not running (set FIRESTORE_EMULATOR_HOST)")
class FirestoreAlbumTest(unittest.TestCase):

    def setUp(self):
        from pm.firestore.client import get_db
        # Clear the albums collection before each test.
        self.db = get_db()
        for doc in self.db.collection("albums").stream():
            doc.reference.delete()
        for doc in self.db.collection("places").stream():
            doc.reference.delete()
        for doc in self.db.collection("photos").stream():
            doc.reference.delete()

    def _make_album(self, **kwargs):
        from pm.firestore.models import Album
        defaults = dict(
            title="Test Album",
            description="Test description",
            lat=Decimal("48.0123"),
            lon=Decimal("8.0123"),
            secret="mysecret",
            password="!",
            user_uid="test-user-uid",
        )
        defaults.update(kwargs)
        album = Album(**defaults)
        album.save(db=self.db)
        return album

    def test_create_and_get_album(self):
        from pm.firestore.models import Album
        album = self._make_album(title="Mannheim 2012")
        self.assertIsNotNone(album.pk)

        fetched = Album.objects.get(pk=album.pk)
        self.assertEqual(fetched.title, "Mannheim 2012")
        self.assertEqual(fetched.user_uid, "test-user-uid")

    def test_album_does_not_exist(self):
        from pm.firestore.models import Album
        with self.assertRaises(Album.DoesNotExist):
            Album.objects.get(pk="nonexistent-id")

    def test_filter_albums_by_user(self):
        from pm.firestore.models import Album
        self._make_album(user_uid="user-a", title="A1")
        self._make_album(user_uid="user-a", title="A2")
        self._make_album(user_uid="user-b", title="B1")

        user_a_albums = Album.objects.filter(user_uid="user-a")
        self.assertEqual(len(user_a_albums), 2)
        titles = {a.title for a in user_a_albums}
        self.assertEqual(titles, {"A1", "A2"})

    def test_update_album(self):
        from pm.firestore.models import Album
        album = self._make_album(title="Original")
        album.title = "Updated"
        album.save(db=self.db)

        fetched = Album.objects.get(pk=album.pk)
        self.assertEqual(fetched.title, "Updated")

    def test_delete_album(self):
        from pm.firestore.models import Album
        album = self._make_album()
        album_pk = album.pk
        album.delete(db=self.db)

        with self.assertRaises(Album.DoesNotExist):
            Album.objects.get(pk=album_pk)

    def test_album_toserializable(self):
        from pm.firestore.models import Album
        album = self._make_album(title="Serialize Me")
        data = album.toserializable(includeplaces=False)
        self.assertEqual(data["title"], "Serialize Me")
        self.assertIn("lat", data)
        self.assertIn("lon", data)
        self.assertIn("secret", data)
        self.assertIn("id", data)


@unittest.skipUnless(EMULATOR_HOST, "Firestore emulator not running (set FIRESTORE_EMULATOR_HOST)")
class FirestorePlaceTest(unittest.TestCase):

    def setUp(self):
        from pm.firestore.client import get_db
        self.db = get_db()
        for collection in ("albums", "places", "photos"):
            for doc in self.db.collection(collection).stream():
                doc.reference.delete()

    def _make_album(self):
        from pm.firestore.models import Album
        album = Album(title="Album", lat=Decimal("48.0"), lon=Decimal("8.0"),
                      secret="s", password="!", user_uid="uid")
        album.save(db=self.db)
        return album

    def _make_place(self, album):
        from pm.firestore.models import Place
        place = Place(title="Place", lat=Decimal("48.1"), lon=Decimal("8.1"),
                      album_id=album.pk)
        place.save(db=self.db)
        return place

    def test_create_and_get_place(self):
        from pm.firestore.models import Place
        album = self._make_album()
        place = self._make_place(album)
        self.assertIsNotNone(place.pk)

        fetched = Place.objects.get(pk=place.pk)
        self.assertEqual(fetched.title, "Place")
        self.assertEqual(fetched.album_id, album.pk)

    def test_filter_places_by_album(self):
        from pm.firestore.models import Place
        album = self._make_album()
        self._make_place(album)
        self._make_place(album)

        places = Place.objects.filter(album_id=album.pk)
        self.assertEqual(len(places), 2)


@unittest.skipUnless(EMULATOR_HOST, "Firestore emulator not running (set FIRESTORE_EMULATOR_HOST)")
class FirestoreUserProfileTest(unittest.TestCase):

    def setUp(self):
        from pm.firestore.client import get_db
        self.db = get_db()
        for doc in self.db.collection("users").stream():
            doc.reference.delete()

    def test_get_or_create(self):
        from pm.firestore.models import UserProfile
        profile, created = UserProfile.objects.get_or_create(
            uid="test-uid", email="test@example.com"
        )
        self.assertTrue(created)
        self.assertEqual(profile.email, "test@example.com")
        self.assertEqual(profile.quota, 367001600)

        profile2, created2 = UserProfile.objects.get_or_create(
            uid="test-uid", email="test@example.com"
        )
        self.assertFalse(created2)
        self.assertEqual(profile2.uid, "test-uid")

    def test_update_used_space(self):
        from pm.firestore.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(uid="uid2", email="u2@example.com")
        profile.used_space = 1024
        profile.save(db=self.db)

        fetched = UserProfile.objects.get(pk="uid2")
        self.assertEqual(fetched.used_space, 1024)
