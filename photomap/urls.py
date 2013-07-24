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
from pm.controller import landingpage
from pm.controller import account

# admin.site.register(model.album.Album)
# admin.site.register(model.photo.Photo)
# admin.site.register(model.place.Place)
# admin.site.register(model.userprofile.UserProfile)
admin.autodiscover()


#================================================================
# user-account hooks
#================================================================
auth_patterns = patterns("pm.controller.authentication",
                         url(r'^login$', "login"),
                         url(r'^login/error/$', "login_error"),
                         url(r'^logout$', "logout")
                         )
account_password_patterns = patterns("pm.controller.account",
                                     url(r'^update', "update_password"),
                                     url(r'^reset$', "reset_password"),
                                     url(r'^reset/requested$', "reset_password_requested"),
                                     url(r'^reset/confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)$', "reset_password_confirm", name="reset_password_confirm"),
                                     url(r'^reset/complete$', "reset_password_complete")
                                     )
account_patterns = patterns("pm.controller.account",
                            url(r'^$', "view"),
                            url(r'^auth/', include(auth_patterns)),
                            url(r'^inactive$', direct_to_template, {"template": "account-inactive.html"}),
                            url(r'^password/', include(account_password_patterns)),
                            url(r'^email/update$', "update_email"),
                            url(r'^delete$', "delete_account"),
                            url(r'^delete/complete$', "delete_account_complete"),
                            url(r'^delete/error$', direct_to_template, {"template": "account-delete-error.html"})
                            )
#================================================================
# album hooks
#================================================================
album_patterns = patterns("pm.controller.album",
                          url(r'^get$', "get"),
                          url(r'^view/(?P<secret>.+)$', "view"),
                          url(r'^delete$', "delete"),
                          url(r'^update$', "update"),
                          url(r'^password/update$', "update_password")
                          )
albums_patterns = patterns("pm.controller",
                           url(r'^get$', "dashboard.get"),
                           url(r'^album/demo$', "album.demo"),
                           url(r'^album/insert$', "album.insert"),
                           url(r'^album/(?P<id>\d+)/', include(album_patterns))
                           )
#================================================================
# place hooks
#================================================================
place_patterns = patterns("pm.controller.place",
                          url(r'^delete$', "delete"),
                          url(r'^update$', "update")
                          )
places_patterns = patterns("pm.controller.place",
                           url(r'^place/insert$', "insert"),
                           url(r'^place/(?P<id>\d+)/', include(place_patterns))
                           )
#================================================================
# photo hooks
#================================================================
photo_patterns = patterns("pm.controller.photo",
                          url(r'^delete$', "delete"),
                          url(r'^update$', "update")
                          )
photos_patterns = patterns("pm.controller.photo",
                           url(r'^update$', "update_multiple"),
                           url(r'^photo/insert$', "insert"),
                           url(r'^photo/(?P<id>\d+)/', include(photo_patterns))
                           )

urlpatterns = patterns("",
                       #========================================================
                       # main
                       #========================================================
                       url(r'^$', landingpage.get_current),
                       
                       url(r'^dashboard$', dashboard.view),
                       
                       url(r'^url/invalid$', direct_to_template, {"template": "url-invalid.html"}),

                       url(r'^debug/(.+)$', debug.view),
                       url(r'^test/(.+)$', debug.test),
                       url(r'^jsi18n/$', 'django.views.i18n.javascript_catalog'),
                       
                       
                       #========================================================
                       # hooks to non-interactive pages
                       #======================================================== 
                       url(r'^impressum$', direct_to_template, {"template": "impressum.html"}),
                       url(r'^privacy$', direct_to_template, {"template": "privacy.html"}),
                       url(r'^copyright$', direct_to_template, {"template": "copyright.html"}),
                       url(r'^contact$', footer.contact),
                       url(r'^contact-success$', footer.contact_success),
                       url(r'^help$', direct_to_template, {"template": "help.html"}),
                       url(r'^team$', direct_to_template, {"template": "team.html"}),
                       url(r'^payment$', direct_to_template, {"template": "payment.html"}),
                       #========================================================
                       # 3rd party apps
                       #========================================================
                       url(r'^admin/', include(admin.site.urls)),
                       #================================================================
                       # album hooks
                       #================================================================
                       url(r'^albums/', include(albums_patterns)),
                       #================================================================
                       # photo hooks
                       #================================================================
                       url(r'^photos/', include(photos_patterns)),
                       #================================================================
                       # place hooks
                       #================================================================
                       url(r'^places/', include(places_patterns)),
                       #================================================================
                       # user-account hooks
                       #================================================================
                       url(r'^account/', include(account_patterns)),
                       )
