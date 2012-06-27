'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from django.conf import settings 
from place import Place

class Photo(Description):
  
    thumb = models.ImageField(upload_to=settings.PHOTO_PATH, height_field=75 , width_field=75)
    photo = models.ImageField(upload_to=settings.PHOTO_PATH)
    place = models.ForeignKey(Place)
    
    class Meta(Description.Meta):
        pass