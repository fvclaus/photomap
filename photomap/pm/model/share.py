'''
Created on Sep 5, 2012

@author: fredo
'''

from django.db import models
from album import Album
from pm import appsettings

class Share(models.Model):
    """
    @author: Frederik Claus
    @summary: Used to share a certain album to anonymous user with the correct token. There should only be one token per album
    """
    album = models.ForeignKey(Album, unique = True)
    token = models.TextField()
    
    class Meta:
        app_label = appsettings.APP_NAME