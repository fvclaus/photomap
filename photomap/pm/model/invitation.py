'''
Created on Jun 22, 2012

@author: fredo
'''
from django.contrib.auth.models import User
from django.db import models
from album import Album
from pm import appsettings

class Invitation(models.Model):
    """
    @author: Frederik Claus
    @summary: Used to share a certain album with user with existing account
    """
    album = models.ForeignKey(Album)
    user = models.ForeignKey(User)
    
    class Meta:
        app_label = appsettings.APP_NAME
 
