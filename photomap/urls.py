'''
Created on Jun 22, 2012

@author: fredo
'''

from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template
from django.shortcuts import redirect
from django.contrib import admin



from pm.controller import photo, place
from pm.controller import authentication 
from pm.controller import album
from pm.controller import dashboard
from pm.controller import debug
from pm.controller import footer

# admin.site.register(model.album.Album)
# admin.site.register(model.photo.Photo)
# admin.site.register(model.place.Place)
# admin.site.register(model.userprofile.UserProfile)
admin.autodiscover()

urlpatterns = patterns("",
                       #========================================================
                       # main
                       #========================================================
                       url(r'^login$', authentication.login),
                       # url(r'^view-album$', album.view),
                       url(r'^album/view/(.+)-(\d+)$', album.view),
                       url(r'^get-all-albums$', dashboard.get),
                       url(r'^get-album$', album.get),
                       
                       url(r'^impressum$', direct_to_template, {"template": "impressum.html"}),
                       url(r'^privacy$', direct_to_template, {"template": "privacy.html"}),
                       url(r'^copyright$', direct_to_template, {"template": "copyright.html"}),
                       url(r'^contact$', footer.contact),
                       url(r'^contact-success$', footer.contact_success),
                       url(r'^help$', direct_to_template, {"template": "help.html"}),
                       url(r'^team$', direct_to_template, {"template": "team.html"}),
                       
                       url(r'^demo$', album.demo),
                       

                       url(r'^logout$', authentication.logout),
                       url(r'^$', direct_to_template, {"template": "index.html"}),
                       
                       url(r'^jsi18n/$', 'django.views.i18n.javascript_catalog'),

                       url(r'^dashboard$', dashboard.view),


                       url(r'^debug/(.+)$', debug.view),
                       
                       #========================================================
                       # 3rd party apps
                       #========================================================
                       url(r'^admin/', include(admin.site.urls)),
                       
        #               (r'^$', direct_to_template, {"template": "index.tpl"}),
                       
                       #================================================================
                       # album hooks
                       #================================================================
                       url(r'^insert-album$', album.insert),
                       url(r'^update-album$', album.update),
                       url(r'^delete-album$', album.delete),
                       url(r'^update-album-password$', album.update_password),
#                       url(r'^album/share/(.+)-(\d+)$', album.share),
                       #================================================================
                       # photo hooks
                       #================================================================
                       url(r'^insert-photo$', photo.insert),
                       url(r'^update-photo$', photo.update),
                       url(r'^update-photos$', photo.update_multiple),
                       url(r'^delete-photo$', photo.delete),
                       #================================================================
                       # place hooks
                       #================================================================
                       url(r'^insert-place$', place.insert),
                       url(r'^update-place$', place.update),
                       url(r'^delete-place$', place.delete)
                       ) 
