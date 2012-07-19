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
   
    lat = models.DecimalField(decimal_places = 26, max_digits = 30)
    lon = models.DecimalField(decimal_places = 26, max_digits = 30)
    user = models.ForeignKey(User)
    country = models.CharField(max_length = 200)
    
    def toserializable(self):
        # avoid circual import
        from pm.model.place import Place
        places = Place.objects.all().filter(album = self)
        logger.debug("toserializable(): %s", places)
        places_dump = []
        
        for place in places:
            places_dump.append(place.toserializable())

        data = {"lat" : self.lat,
                "lon" : self.lon,
                "title" : self.title,
                "country" : self.country,
                "description" : self.description,
                "id" : self.pk,
                "places": places_dump}
        return data
    
    def __unicode__(self):
        return "%s by %s" % (self.title, self.user.username)
   
    class Meta(Description.Meta):
        pass
