'''
Created on Sep 5, 2012

@author: fredo
'''

from django.db import models
from album import Album
from pm import appsettings
from django.db.models.signals import post_save

class Share(models.Model):
    """
    @author: Frederik Claus
    @summary: Used to share a certain album to anonymous user with the correct token. There should only be one token per album
    """
    album = models.ForeignKey(Album, unique = True)
    password = models.TextField(blank = True, null = True)
    
    class Meta:
        app_label = appsettings.APP_NAME
        
def create_share(sender, instance, created, **kwargs):
    """
    @author: Frederik Claus
    @summary: Adds the additional fields to a new user on creation
    """
    import logging
    logger = logging.getLogger(__name__)
        
    if kwargs['raw']:
        logger.debug("Skipping creating of album share. This is a raw query.")
    elif created:
        logger.debug("Creating album share")
        Share.objects.using(kwargs["using"]).create(album = instance)


post_save.connect(create_share, sender = Album)