'''
Created on Jun 22, 2012

@author: fredo
'''

from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template
from django.contrib import admin

from django.contrib import admin

from map.controller import photo, place

#admin.site.register(model.album.Album)
#admin.site.register(model.photo.Photo)
#admin.site.register(model.place.Place)
#admin.site.register(model.userprofile.UserProfile)
admin.autodiscover()

urlpatterns = patterns("",
#               (r'^$', direct_to_template, {"template": "index.tpl"}),
               url(r'^admin/', include(admin.site.urls)),
               #================================================================
               # photo hooks
               #================================================================
               url(r'^insert-photo', photo.insert),
               url(r'^update-photo', photo.update),
               url(r'^delete-photo', photo.delete),
               #================================================================
               # place hooks
               #================================================================
               url(r'^insert-place', place.insert),
               url(r'^update-place', place.update),
               url(r'^delete-place', place.delete)
               ) 
