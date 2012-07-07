'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from django.conf import settings 
from place import Place

class Photo(Description):
  
    thumb = models.ImageField(upload_to = settings.PHOTO_PATH, null = True, blank = True)
    photo = models.ImageField(upload_to = settings.PHOTO_PATH)
    place = models.ForeignKey(Place)
    
    def __unicode__(self):
        return "%s in %s" % (self.title, self.place.title)
    
    class Meta(Description.Meta):
        pass
