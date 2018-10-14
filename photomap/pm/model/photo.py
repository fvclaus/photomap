from django.db import models
from .description import Description
from .place import Place


class Photo(Description):
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    order = models.IntegerField()
    photo = models.BinaryField()
    thumb = models.BinaryField()
    size = models.IntegerField()

    def getphotourl(self):
        # TODO secure these urls
        return "/photo/original/%d" % (self.id, )

    def getthumburl(self):
        # TODO secure these urls
        return "/photo/thumb/%d" % (self.thumb, )

    def toserializable(self):
        return {"thumb": self.getthumburl(),
                "id": self.pk,
                "photo": self.getphotourl(),
                "title": self.title,
                "description": self.description,
                "order": self.order,
                "date": self.date.isoformat()}

    def __unicode__(self):
        return "%s in %s" % (self.title, self.place.title)

    class Meta(Description.Meta):
        pass
