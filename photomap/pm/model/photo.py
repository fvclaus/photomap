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

class Photo(Description):
  
    thumb = models.ImageField(upload_to = settings.PHOTO_PATH, null = True, blank = True)
    photo = models.ImageField(upload_to = settings.PHOTO_PATH)
    place = models.ForeignKey(Place)
    order = models.IntegerField(null = True, blank = True)
    
    def getphotourl(self):
        return os.path.relpath(self.photo.path, settings.PROJECT_PATH)
    
    def toserializable(self):
        return {"thumb": self.getphotourl(),
                "photo": self.getphotourl(),
                "title": self.title,
                "description": self.description,
                "order": self.order}
    
    def __unicode__(self):
        return "%s in %s" % (self.title, self.place.title)
    
    class Meta(Description.Meta):
        pass
