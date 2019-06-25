import logging

from django.db import models

from .description import Description
from .userprofile import User

logger = logging.getLogger(__name__)


class Album(Description):
    lat = models.DecimalField(decimal_places=7, max_digits=10)
    lon = models.DecimalField(decimal_places=7, max_digits=10)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    secret = models.TextField()
    password = models.TextField()

    def toserializable(self, includeplaces=True, isowner=True):
        # avoid circular import
        from pm.models.place import Place

        if isowner:
            data = {"lat": self.lat,
                    "lon": self.lon,
                    "title": self.title,
                    "description": self.description,
                    "date": self.date.isoformat(),
                    "secret": self.secret,
                    "id": self.pk}
        else:
            data = {"lat": self.lat,
                    "lon": self.lon,
                    "country": self.country}

        data["isOwner"] = isowner

        if includeplaces:
            places_dump = []
            places = Place.objects.all().filter(album=self)

            for place in places:
                places_dump.append(place.toserializable())
            if places:
                data["places"] = places_dump
            else:
                data["places"] = []

        return data

    def __unicode__(self):
        return "%s by %s" % (self.title, self.user.username)

    class Meta(Description.Meta):
        pass
