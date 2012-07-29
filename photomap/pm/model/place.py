'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from album import Album

import json

class Place(Description):
     
   
    lat = models.DecimalField(decimal_places = 140, max_digits = 150)
    lon = models.DecimalField(decimal_places = 140, max_digits = 150)
    album = models.ForeignKey(Album)
    
    def toserializable(self):
        # avoid circular import 
        from pm.model.photo import Photo
        photos = Photo.objects.all().filter(place = self)  
        photos_dump = []
        for photo in photos:
            photos_dump.append(photo.toserializable())
    
        data = {"lat": self.lat,
                "lon": self.lon,
                "title": self.title,
                "description": self.description,
                "id": self.pk,
                "photos": photos_dump,
                "date" : self.date.isoformat() }
        return data
    
    def __unicode__(self):
        return "%s in %s" % (self.title, self.album.title)
     
    class Meta(Description.Meta):
        pass
