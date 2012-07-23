'''
Created on Jun 22, 2012

@author: fredo
'''

from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template
from django.contrib import admin



from pm.controller import photo, place
from pm.controller import authentication 
from pm.controller import album
from pm.controller import dashboard

#admin.site.register(model.album.Album)
#admin.site.register(model.photo.Photo)
#admin.site.register(model.place.Place)
#admin.site.register(model.userprofile.UserProfile)
admin.autodiscover()

urlpatterns = patterns("",
                       #========================================================
                       # main
                       #========================================================
                       url(r'^login', authentication.login),
                       url(r'^view-album', album.view),
                       url(r'^get-album', album.get),
                       
                       url(r'^impressum', direct_to_template, {"template": "impressum.html"}),
                       url(r'^privacy', direct_to_template, {"template": "privacy.html"}),
                       url(r'^copyright', direct_to_template, {"template": "copyright"}),
                       url(r'^contact', direct_to_template, {"template": "contact.html"}),
                       url(r'^help', direct_to_template, {"template": "help.html"}),
                       url(r'^about-us', direct_to_template, {"template": "about-us.html"}),
                       
                       url(r'^get-dashboard', dashboard.get),
                       url(r'^view-dashboard', dashboard.view),
                       
     
                       
                       #========================================================
                       # legacy
                       #========================================================
                       url(r'^album', album.redirect_to_get),
                       url(r'^dashboard', dashboard.redirect_to_get),
                       #========================================================
                       # 3rd party apps
                       #========================================================
                       url(r'^admin/', include(admin.site.urls)),
                       
        #               (r'^$', direct_to_template, {"template": "index.tpl"}),
                       
                            
                       
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
