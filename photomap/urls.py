'''
Created on Jun 22, 2012

@author: fredo
'''

from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template
from django.contrib import admin
from django.contrib.auth.views import logout



from pm.controller import album, place, photo
from pm.controller import dashboard
from pm.controller import footer
from pm.controller import landingpage
from pm.controller import account
# from pm.controller.router import method_mapper

# admin.site.register(model.album.Album)
# admin.site.register(model.photo.Photo)
# admin.site.register(model.place.Place)
# admin.site.register(model.userprofile.UserProfile)
admin.autodiscover()

from django.http import Http404, HttpResponseNotAllowed

GET = 'GET'
PUT = 'PUT'
POST = 'POST'
HEAD = 'HEAD'
TRACE = 'TRACE'
DELETE = 'DELETE'
OPTIONS = 'OPTIONS'

HTTP_METHODS = (GET, POST, PUT, HEAD, DELETE, OPTIONS, TRACE)

def dispatch(request, *args, **kwargs):
    handler = kwargs.pop(request.method, None)
    if handler:
        for method in HTTP_METHODS:
            kwargs.pop(method, None)
        return handler(request, *args, **kwargs)
    else:
        allowed_methods = []
        for method in HTTP_METHODS:
            if kwargs.pop(method, None):
                allowed_methods.append(method)
        if allowed_methods:
            return HttpResponseNotAllowed(allowed_methods)
        else:
            raise Http404

def method_mapper(regex, controller_name, get = None, post = None, put = None, delete = None, head = None, options = None, trace = None):
    handlers = { GET: get, POST: post, PUT: put, DELETE: delete, HEAD: head, OPTIONS: options, TRACE: trace }
    return url(regex, dispatch, handlers, controller_name)

#================================================================
# user-account hooks
#================================================================
auth_patterns = patterns("pm.controller.authentication",
                         url(r'^login$', "login"),
                         url(r'^login/error/$', "login_error"),
                         url(r'^logout$', logout, { "next_page" : "/" })
                         )
account_password_patterns = patterns("pm.controller.account",
                                     url(r'^', "update_password"),  # accepts only POST
                                     url(r'^reset$', "reset_password"),
                                     url(r'^reset/requested$', "reset_password_requested"),
                                     url(r'^reset/confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)$', "reset_password_confirm", name = "reset_password_confirm"),
                                     url(r'^reset/complete$', "reset_password_complete")
                                     )
account_patterns = patterns("pm.controller.account",
                            method_mapper(r'^$', "account", get = account.view, delete = account.delete),
                            url(r'^delete$', "delete"),
                            url(r'^auth/', include(auth_patterns)),
                            url(r'^inactive$', direct_to_template, {"template": "account/inactive.html"}),
                            url(r'^password/', include(account_password_patterns)),
                            url(r'^email/$', "update_email"),  # accepts only POST
                            url(r'^delete/success$', direct_to_template, {"template" : "account/delete-success.html"})
                            )
#================================================================
# dialog hooks
#================================================================
form_patterns = patterns("",
                           url(r'^insert/album$', direct_to_template, {"template": "form/insert/album.html"}),
                           url(r'^insert/place$', direct_to_template, {"template": "form/insert/place.html"}),
                           url(r'^insert/photo$', photo.get_insert_dialog),
                           url(r'^update/model$', direct_to_template, {"template": "form/update/model.html"}),
                           url(r'^update/album/password$', direct_to_template, {"template": "form/update/album-password.html"}),
                           url(r'^update/photos$', direct_to_template, {"template": "form/update/photos.html"}),
                           url(r'^delete/model$', direct_to_template, {"template": "form/delete/model.html"})
                           )
#================================================================
# album hooks
#================================================================
album_patterns = patterns("pm.controller.album",
                           url(r'^$', "insert"),  # accepts only POST
                           method_mapper(r'^(?P<album_id>\d+)/$', "album", get = album.get, post = album.update, delete = album.delete),
                           url(r'^(?P<album_id>\d+)/view/(?P<secret>.+)/$', "view"),
                           url(r'^(?P<album_id>\d+)/password$', "update_password"),  # accepts only POST
                           url(r'^album/demo$', "demo")
                           )
#================================================================
# place hooks
#================================================================
place_patterns = patterns("pm.controller.place",
                           url(r'^$', "insert"),  # accepts only POST
                           method_mapper(r'^(?P<place_id>\d+)/$', "place", post = place.update, delete = place.delete),
                           )
#================================================================
# photo hooks
#================================================================
photo_patterns = patterns("pm.controller.photo",
                           url(r'^$', "insert"),  # accepts only POST
                           method_mapper(r'^(?P<photo_id>\d+)/$', "photo", post = photo.update, delete = photo.delete),
                           )

urlpatterns = patterns("",
                       #========================================================
                       # main
                       #========================================================
                       url(r'^$', landingpage.view),
                       
                       url(r'^dashboard/$', dashboard.view),


                       url(r'^test$', direct_to_template, {"template": "runner.html"}),
                       url(r'^jsi18n/$', 'django.views.i18n.javascript_catalog'),
                       
                       #========================================================
                       # hooks to non-interactive pages
                       #======================================================== 
                       url(r'^impressum$', direct_to_template, {"template": "footer/impressum.html"}),
                       url(r'^privacy$', direct_to_template, {"template": "footer/privacy.html"}),
                       url(r'^copyright$', direct_to_template, {"template": "footer/copyright.html"}),
                       url(r'^contact$', footer.contact),
                       url(r'^contact/success$', footer.contact_success),
                       url(r'^help$', direct_to_template, {"template": "footer/help.html"}),
                       url(r'^team$', direct_to_template, {"template": "footer/team.html"}),
                       url(r'^payment$', direct_to_template, {"template": "footer/payment.html"}),
                       #========================================================
                       # 3rd party apps
                       #========================================================
                       url(r'^admin/', include(admin.site.urls)),
                       #================================================================
                       # dialog hooks
                       #================================================================
                       url(r'^form/', include(form_patterns)),
                       #================================================================
                       # album hooks
                       #================================================================
                       url(r'^albums$', dashboard.get),
                       url(r'^album/', include(album_patterns)),
                       #================================================================
                       # photo hooks
                       #================================================================
                       url(r'^photos$', photo.update_multiple),
                       url(r'^photo/', include(photo_patterns)),
                       #================================================================
                       # place hooks
                       #================================================================
                       url(r'^place/', include(place_patterns)),
                       #================================================================
                       # user-account hooks
                       #================================================================
                       url(r'^account/', include(account_patterns)),
                       )


