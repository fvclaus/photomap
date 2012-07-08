'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from album import Album

class Place(Description):
     
   
    lat = models.DecimalField(decimal_places = 98, max_digits = 100)
    lon = models.DecimalField(decimal_places = 98, max_digits = 100)
    album = models.ForeignKey(Album)
    
    def __unicode__(self):
        return "%s in %s" % (self.title, self.album.title)
     
    class Meta(Description.Meta):
        pass
