from django.db import models

from .album import Album
from .description import Description


class Place(Description):
    lat = models.DecimalField(decimal_places=7, max_digits=10)
    lon = models.DecimalField(decimal_places=7, max_digits=10)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)

    def toserializable(self):
        # avoid circular import
        from pm.models.photo import Photo
        photos = Photo.objects.all().filter(place=self)
        photos_dump = []
        for photo in photos:
            photos_dump.append(photo.toserializable())

        data = {"lat": self.lat,
                "lon": self.lon,
                "title": self.title,
                "description": self.description,
                "id": self.pk,
                "photos": photos_dump,
                "date": self.date.isoformat()}
        return data

    def __unicode__(self):
        return "%s in %s" % (self.title, self.album.title)

    class Meta(Description.Meta):
        pass
