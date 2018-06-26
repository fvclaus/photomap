'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from django.conf import settings 
from place import Place
from django.db.models.signals import post_delete
import os
from pm.util.file_storage import delete_file, build_url


class Photo(Description):
  
    place = models.ForeignKey(Place)
    order = models.IntegerField()
    photo = models.TextField()
    thumb = models.TextField()
    size = models.IntegerField()
    
    if settings.DEBUG:
        photo = models.ImageField(upload_to = settings.PHOTO_PATH, max_length = 500)
        thumb = models.ImageField(upload_to = settings.PHOTO_PATH, max_length = 500)
        
    def getphotourl(self):
        return build_url(self.photo)
        
    def getthumburl(self):
        return build_url(self.thumb)
    
    def toserializable(self):
        return {"thumb": self.getthumburl(),
                "id" : self.pk,
                "photo": self.getphotourl(),
                "title": self.title,
                "description": self.description,
                "order": self.order,
                "date" : self.date.isoformat()}
    
    def __unicode__(self):
        return "%s in %s" % (self.title, self.place.title)
    
    class Meta(Description.Meta):
        pass


def deletephoto(sender, **kwargs):
    instance = kwargs["instance"]
    try:
        delete_file(instance.photo)
    except:
        pass
    try:
        delete_file(instance.thumb)
    except:
        pass
            

post_delete.connect(deletephoto, sender = Photo)
