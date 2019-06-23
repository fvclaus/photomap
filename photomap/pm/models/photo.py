import uuid

from django.db import models

from .description import Description
from .place import Place


class Photo(Description):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    order = models.IntegerField()
    photo = models.BinaryField()
    thumb = models.BinaryField()
    size = models.IntegerField()

    def getphotourl(self):
        return "/photo/original/%s" % (self.id, )

    def getthumburl(self):
        return "/photo/thumb/%s" % (self.id, )

    def toserializable(self):
        return {"thumb": self.getthumburl(),
                "id": str(self.pk),
                "photo": self.getphotourl(),
                "title": self.title,
                "description": self.description,
                "order": self.order,
                "date": self.date.isoformat()}

    def __unicode__(self):
        return "%s in %s" % (self.title, self.place.title)

    class Meta(Description.Meta):
        pass
