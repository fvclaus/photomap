'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from django.conf import settings 
from place import Place
import json
import os
from django.db.models.signals import post_delete

class Photo(Description):
  
    thumb = models.ImageField(upload_to = settings.PHOTO_PATH, null = True, blank = True, max_length = 500)
    photo = models.ImageField(upload_to = settings.PHOTO_PATH, max_length = 500)
    place = models.ForeignKey(Place)
    order = models.IntegerField(null = True, blank = True)
    
    def getphotourl(self):
        return os.path.relpath(self.photo.path, settings.PROJECT_PATH)
    
    def toserializable(self):
        return {"thumb": self.getphotourl(),
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


def deletephoto(sender,**kwargs):
    instance = kwargs["instance"]
    try:
        os.remove(instance.photo.path)
    except:
        pass

post_delete.connect(deletephoto)