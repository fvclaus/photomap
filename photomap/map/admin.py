'''
Created on Jun 22, 2012

@author: fredo
'''
from django.contrib import admin

from map import model

admin.site.register(model.album.Album)
admin.site.register(model.photo.Photo)
admin.site.register(model.place.Place)
admin.site.register(model.userprofile.UserProfile)