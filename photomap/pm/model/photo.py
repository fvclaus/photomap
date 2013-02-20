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
from pm.util.s3 import getbucket, build_url, delete_key

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
        if settings.DEBUG:
            return "/" + os.path.relpath(self.photo.path, settings.PROJECT_PATH)
        else:
            return build_url(self.photo)
        
    def getthumburl(self):
        if settings.DEBUG:
            return "/" + os.path.relpath(self.thumb.path, settings.PROJECT_PATH)
        else:
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
    if settings.DEBUG:
        try:
            os.remove(instance.photo.path)
        except:
            pass
        try:
            os.remove(instance.thumb.path)
        except:
            pass
    else:
        try:
            delete_key(instance.photo)
        except:
            pass
        try:
            delete_key(instance.thumb)
        except:
            pass
    
            

post_delete.connect(deletephoto, sender = Photo)
