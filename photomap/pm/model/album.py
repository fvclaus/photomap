'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from django.contrib.auth.models import User


import logging

logger = logging.getLogger(__name__)

class Album(Description):
   
    lat = models.DecimalField(decimal_places = 140, max_digits = 150)
    lon = models.DecimalField(decimal_places = 140, max_digits = 150)
    user = models.ForeignKey(User)
    country = models.CharField(max_length = 2)
    
    def toserializable(self,includeplaces = True, guest = False):
        # avoid circular import
        from pm.model.place import Place
        
        if not guest:
            data = {"lat": self.lat,
                    "lon": self.lon,
                    "title": self.title,
                    "country": self.country,
                    "description": self.description,
                    "date": self.date.isoformat(),
                    "id": self.pk}
        else:
            data = {"lat" : self.lat,
                    "lon" : self.lon,
                    "country": self.country}
        
        if includeplaces:
            places_dump = []
            places = Place.objects.all().filter(album = self)
            logger.debug("toserializable(): %s", places)
            
            for place in places:
                places_dump.append(place.toserializable())
                data["places"] = places_dump
                
        return data
    
    def __unicode__(self):
        return "%s by %s" % (self.title, self.user.username)
   
    class Meta(Description.Meta):
        pass
