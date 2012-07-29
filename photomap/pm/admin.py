'''
Created on Jun 22, 2012

@author: fredo
'''
from django.contrib import admin
from django.conf import settings
from pm import model

if settings.DEBUG:
    admin.site.register(model.album.Album)
    admin.site.register(model.photo.Photo)
    admin.site.register(model.place.Place)
    admin.site.register(model.userprofile.UserProfile)
