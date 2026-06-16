"""
Firestore-backed model classes that replace the Django ORM models.

Data structure in Firestore:
  /albums/{album_id}  → { user_uid, title, lat, lon, secret, password, date, description }
  /places/{place_id}  → { album_id, title, lat, lon, date, description }
  /photos/{photo_id}  → { place_id, title, order, size, photo_url, thumb_url, date, description, uuid }
  /users/{uid}        → { email, quota, used_space }
"""

import logging
import uuid as uuid_lib
from datetime import datetime, timezone
from decimal import Decimal

from .client import get_db

logger = logging.getLogger(__name__)


class DoesNotExist(Exception):
    pass


class MultipleObjectsReturned(Exception):
    pass


class FirestoreQuerySet:
    """Minimal QuerySet-like interface backed by a Firestore collection query."""

    def __init__(self, collection_name, filters=None, db=None):
        self._collection = collection_name
        self._filters = filters or []
        self._db = db

    def _get_db(self):
        return self._db or get_db()

    def _build_query(self):
        ref = self._get_db().collection(self._collection)
        for field, op, value in self._filters:
            ref = ref.where(field, op, value)
        return ref

    def filter(self, **kwargs):
        new_filters = list(self._filters)
        for key, value in kwargs.items():
            new_filters.append((key, "==", value))
        return FirestoreQuerySet(self._collection, new_filters, self._db)

    def all(self):
        return list(self)

    def __iter__(self):
        raise NotImplementedError("Subclasses must implement __iter__")

    def __len__(self):
        return sum(1 for _ in self)


class FirestoreManager:
    """Manager that provides ORM-like access to a Firestore collection."""

    model_class = None
    collection_name = None

    def __init__(self, db=None):
        self._db = db

    def _get_db(self):
        return self._db or get_db()

    def get(self, pk=None, **kwargs):
        if pk is not None:
            doc = self._get_db().collection(self.collection_name).document(str(pk)).get()
            if not doc.exists:
                raise self.model_class.DoesNotExist(
                    f"{self.model_class.__name__} with pk={pk} does not exist"
                )
            instance = self.model_class._from_doc(doc)
            for key, value in kwargs.items():
                if getattr(instance, key) != value:
                    raise self.model_class.DoesNotExist(
                        f"{self.model_class.__name__} with pk={pk} does not match filter {key}={value}"
                    )
            return instance
        else:
            results = list(self.filter(**kwargs))
            if len(results) == 0:
                raise self.model_class.DoesNotExist(f"No {self.model_class.__name__} matching {kwargs}")
            if len(results) > 1:
                raise MultipleObjectsReturned(f"Multiple {self.model_class.__name__} matching {kwargs}")
            return results[0]

    def filter(self, **kwargs):
        query = self._get_db().collection(self.collection_name)
        for key, value in kwargs.items():
            if hasattr(value, "pk"):
                query = query.where(f"{key}_id", "==", str(value.pk))
            elif hasattr(value, "uid"):
                query = query.where(f"{key}_uid", "==", value.uid)
            else:
                query = query.where(key, "==", value)
        docs = query.stream()
        return [self.model_class._from_doc(doc) for doc in docs]

    def all(self):
        docs = self._get_db().collection(self.collection_name).stream()
        return [self.model_class._from_doc(doc) for doc in docs]

    def create(self, **kwargs):
        instance = self.model_class(**kwargs)
        instance.save()
        return instance


class FirestoreModel:
    """Base class for Firestore-backed models."""

    collection_name = None
    objects = None  # Set to a FirestoreManager subclass instance per model

    def __init__(self, **kwargs):
        self.pk = kwargs.pop("pk", None)
        for key, value in kwargs.items():
            setattr(self, key, value)
        if not hasattr(self, "date") or self.date is None:
            self.date = datetime.now(timezone.utc)

    @classmethod
    def _from_doc(cls, doc):
        data = doc.to_dict()
        data["pk"] = doc.id
        if "date" in data and hasattr(data["date"], "isoformat"):
            pass  # already a datetime
        return cls(**data)

    def _to_dict(self):
        raise NotImplementedError

    def save(self, db=None):
        db = db or get_db()
        data = self._to_dict()
        if self.pk:
            db.collection(self.collection_name).document(str(self.pk)).set(data)
        else:
            _, ref = db.collection(self.collection_name).add(data)
            self.pk = ref.id
        return self

    def delete(self, db=None):
        db = db or get_db()
        if self.pk:
            db.collection(self.collection_name).document(str(self.pk)).delete()

    class DoesNotExist(Exception):
        pass


class UserProfile(FirestoreModel):
    collection_name = "users"

    def __init__(self, **kwargs):
        self.uid = kwargs.pop("uid", None)
        self.pk = self.uid
        self.email = kwargs.pop("email", "")
        self.quota = kwargs.pop("quota", 367001600)
        self.used_space = kwargs.pop("used_space", 0)
        self.date = kwargs.pop("date", datetime.now(timezone.utc))

    @classmethod
    def _from_doc(cls, doc):
        data = doc.to_dict() or {}
        data["uid"] = doc.id
        return cls(**data)

    def _to_dict(self):
        return {
            "email": self.email,
            "quota": self.quota,
            "used_space": self.used_space,
        }

    def save(self, db=None):
        db = db or get_db()
        db.collection(self.collection_name).document(self.uid).set(self._to_dict())
        return self

    def get_limit(self):
        BYTE_TO_MBYTE = pow(2, 20)
        return "%.1f/%.1f MB" % (self.used_space / BYTE_TO_MBYTE, self.quota / BYTE_TO_MBYTE)

    class DoesNotExist(Exception):
        pass


class UserProfileManager(FirestoreManager):
    model_class = UserProfile
    collection_name = "users"

    def get_or_create(self, uid, email, quota=367001600):
        db = get_db()
        doc = db.collection("users").document(uid).get()
        if doc.exists:
            return UserProfile._from_doc(doc), False
        profile = UserProfile(uid=uid, email=email, quota=quota)
        profile.save(db=db)
        return profile, True


UserProfile.objects = UserProfileManager()


class Album(FirestoreModel):
    collection_name = "albums"

    def __init__(self, **kwargs):
        self.pk = kwargs.pop("pk", None)
        self.title = kwargs.pop("title", "")
        self.description = kwargs.pop("description", "")
        self.lat = Decimal(str(kwargs.pop("lat", 0)))
        self.lon = Decimal(str(kwargs.pop("lon", 0)))
        self.secret = kwargs.pop("secret", "")
        self.password = kwargs.pop("password", "!")
        self.user_uid = kwargs.pop("user_uid", None)
        self.date = kwargs.pop("date", datetime.now(timezone.utc))
        # Keep user attribute for compatibility with views that check album.user == request.user
        self._user = None

    @property
    def user(self):
        return self._user

    @user.setter
    def user(self, value):
        if hasattr(value, "uid"):
            self.user_uid = value.uid
            self._user = value
        else:
            self._user = value

    @classmethod
    def _from_doc(cls, doc):
        data = doc.to_dict() or {}
        data["pk"] = doc.id
        return cls(**data)

    def _to_dict(self):
        return {
            "title": self.title,
            "description": self.description or "",
            "lat": str(self.lat),
            "lon": str(self.lon),
            "secret": self.secret,
            "password": self.password,
            "user_uid": self.user_uid,
            "date": self.date,
        }

    def toserializable(self, includeplaces=True, isowner=True):
        data = {
            "lat": float(self.lat),
            "lon": float(self.lon),
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat() if hasattr(self.date, "isoformat") else str(self.date),
            "secret": self.secret,
            "id": self.pk,
            "isOwner": isowner,
        }
        if includeplaces:
            places = Place.objects.filter(album_id=self.pk)
            data["places"] = [p.toserializable() for p in places]
        return data

    class DoesNotExist(Exception):
        pass


class AlbumManager(FirestoreManager):
    model_class = Album
    collection_name = "albums"

    def filter(self, **kwargs):
        query = get_db().collection(self.collection_name)
        for key, value in kwargs.items():
            if key == "user":
                query = query.where("user_uid", "==", value.uid if hasattr(value, "uid") else value)
            elif key == "album":
                query = query.where("album_id", "==", value.pk if hasattr(value, "pk") else value)
            else:
                query = query.where(key, "==", value)
        return [Album._from_doc(doc) for doc in query.stream()]


Album.objects = AlbumManager()


class Place(FirestoreModel):
    collection_name = "places"

    def __init__(self, **kwargs):
        self.pk = kwargs.pop("pk", None)
        self.title = kwargs.pop("title", "")
        self.description = kwargs.pop("description", "")
        self.lat = Decimal(str(kwargs.pop("lat", 0)))
        self.lon = Decimal(str(kwargs.pop("lon", 0)))
        self.album_id = kwargs.pop("album_id", None)
        self.date = kwargs.pop("date", datetime.now(timezone.utc))
        self._album = None

    @property
    def album(self):
        if self._album is None and self.album_id:
            self._album = Album.objects.get(pk=self.album_id)
        return self._album

    @album.setter
    def album(self, value):
        if value is not None:
            self.album_id = value.pk
        self._album = value

    @classmethod
    def _from_doc(cls, doc):
        data = doc.to_dict() or {}
        data["pk"] = doc.id
        return cls(**data)

    def _to_dict(self):
        return {
            "title": self.title,
            "description": self.description or "",
            "lat": str(self.lat),
            "lon": str(self.lon),
            "album_id": self.album_id,
            "date": self.date,
        }

    def toserializable(self):
        photos = Photo.objects.filter(place_id=self.pk)
        return {
            "lat": float(self.lat),
            "lon": float(self.lon),
            "title": self.title,
            "description": self.description,
            "id": self.pk,
            "photos": [p.toserializable() for p in photos],
            "date": self.date.isoformat() if hasattr(self.date, "isoformat") else str(self.date),
        }

    class DoesNotExist(Exception):
        pass


class PlaceManager(FirestoreManager):
    model_class = Place
    collection_name = "places"

    def filter(self, **kwargs):
        query = get_db().collection(self.collection_name)
        for key, value in kwargs.items():
            if key == "album":
                query = query.where("album_id", "==", value.pk if hasattr(value, "pk") else value)
            else:
                query = query.where(key, "==", value)
        return [Place._from_doc(doc) for doc in query.stream()]


Place.objects = PlaceManager()


class Photo(FirestoreModel):
    collection_name = "photos"

    def __init__(self, **kwargs):
        self.pk = kwargs.pop("pk", None)
        self.title = kwargs.pop("title", "")
        self.description = kwargs.pop("description", "")
        self.place_id = kwargs.pop("place_id", None)
        self.order = kwargs.pop("order", 0)
        self.size = kwargs.pop("size", 0)
        self.photo_url = kwargs.pop("photo_url", "")
        self.thumb_url = kwargs.pop("thumb_url", "")
        self.uuid = kwargs.pop("uuid", str(uuid_lib.uuid4()))
        self.date = kwargs.pop("date", datetime.now(timezone.utc))
        self._place = None

    @property
    def place(self):
        if self._place is None and self.place_id:
            self._place = Place.objects.get(pk=self.place_id)
        return self._place

    @place.setter
    def place(self, value):
        if value is not None:
            self.place_id = value.pk
        self._place = value

    def getphotourl(self):
        return self.photo_url

    def getthumburl(self):
        return self.thumb_url

    @classmethod
    def _from_doc(cls, doc):
        data = doc.to_dict() or {}
        data["pk"] = doc.id
        return cls(**data)

    def _to_dict(self):
        return {
            "title": self.title,
            "description": self.description or "",
            "place_id": self.place_id,
            "order": self.order,
            "size": self.size,
            "photo_url": self.photo_url,
            "thumb_url": self.thumb_url,
            "uuid": self.uuid,
            "date": self.date,
        }

    def toserializable(self):
        return {
            "thumb": self.getthumburl(),
            "id": self.pk,
            "photo": self.getphotourl(),
            "title": self.title,
            "description": self.description,
            "order": self.order,
            "date": self.date.isoformat() if hasattr(self.date, "isoformat") else str(self.date),
        }

    class DoesNotExist(Exception):
        pass


class PhotoManager(FirestoreManager):
    model_class = Photo
    collection_name = "photos"

    def filter(self, **kwargs):
        query = get_db().collection(self.collection_name)
        for key, value in kwargs.items():
            if key == "place":
                query = query.where("place_id", "==", value.pk if hasattr(value, "pk") else value)
            else:
                query = query.where(key, "==", value)
        return [Photo._from_doc(doc) for doc in query.stream()]

    def get(self, pk=None, uuid=None, **kwargs):
        if uuid is not None:
            docs = get_db().collection(self.collection_name).where("uuid", "==", str(uuid)).stream()
            results = [Photo._from_doc(doc) for doc in docs]
            if not results:
                raise Photo.DoesNotExist(f"Photo with uuid={uuid} does not exist")
            return results[0]
        return super().get(pk=pk, **kwargs)


Photo.objects = PhotoManager()
