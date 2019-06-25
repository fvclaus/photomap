from django.conf.urls import url
from django.contrib import admin
from django.http import Http404, HttpResponseNotAllowed
from django.urls import include, path
from django.views.i18n import JavaScriptCatalog

from pm.view import (account, album, authentication, dashboard, footer,
                     landingpage, photo, place, registration)
from pm.views import direct_to_template

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


def method_mapper(regex, controller_name, get=None, post=None, put=None, delete=None, head=None, options=None, trace=None):
    handlers = {GET: get, POST: post, PUT: put, DELETE: delete,
                HEAD: head, OPTIONS: options, TRACE: trace}
    return url(regex, dispatch, handlers, controller_name)


# ================================================================
# user-account hooks
# ================================================================

# TODO Convert to new path API: https://docs.djangoproject.com/en/2.1/releases/2.0/#simplified-url-routing-syntax

account_patterns = [method_mapper(r'^$', "account", get=account.view, delete=account.delete),
                    url(r'^delete$', account.delete),
                    # url(r'^auth/', include(auth_patterns)),
                    url(r'^inactive$', direct_to_template(
                        "account/inactive.html")),
                    # url(r'^password/', include(account_password_patterns)),
                    url(r'^email/$', account.update_email),  # accepts only POST
                    url(r'^delete/complete/$', direct_to_template("account/delete-complete.html"))]

account_patterns += [url(r'^login/$', authentication.login, name="login"),
                     url(r'^logout/$', authentication.logout, {"next_page": "/"})]

account_patterns += [
    url(r'^register/$',
        registration.RegistrationView.as_view(),
        name='registration_register'),
    path('password_change/', account.PasswordChangeView.as_view(),
         name='password_change'),
    url(r'^', include('django_registration.backends.activation.urls')),
    # Make sure the password of the test user cannot be reset.
    url(r'^', include('django.contrib.auth.urls'))]
# ================================================================
# dialog hooks
# ================================================================
form_patterns = [url(r'^insert/album$', direct_to_template("form/insert/album.html")),
                 url(r'^insert/place$', direct_to_template("form/insert/place.html")),
                 url(r'^insert/photo$', photo.get_insert_dialog),
                 url(r'^update/model$', direct_to_template("form/update/model.html")),
                 url(r'^update/album/password$',
                     direct_to_template("form/update/album-password.html")),
                 url(r'^update/photos$',
                     direct_to_template("form/update/photos.html")),
                 url(r'^delete/model$', direct_to_template("form/delete/model.html"))]
# ================================================================
# album hooks
# ================================================================
album_patterns = [url(r'^$', album.insert),  # accepts only POST
                  method_mapper(r'^(?P<album_id>\d+)/$', "album.album",
                                get=album.get, post=album.update, delete=album.delete),
                  url(r'^(?P<album_id>\d+)/view/(?P<secret>.+)/$', album.view),
                  url(r'^(?P<album_id>\d+)/password$',
                      album.update_password),  # accepts only POST
                  url(r'^demo$', album.demo)]
# ================================================================
# place hooks
# ================================================================
place_patterns = [url(r'^$', place.insert),  # accepts only POST
                  method_mapper(r'^(?P<place_id>\d+)/$', "place.place", post=place.update, delete=place.delete)]
# ================================================================
# photo hooks
# ================================================================
photo_patterns = [url(r'^$', photo.insert),  # accepts only POST
                  method_mapper(r'^(?P<photo_id>\d+)/$', "photo.photo",
                                post=photo.update, delete=photo.delete),
                  url(r'^(thumb|original)/(?P<photo_id>.+)/$',
                      photo.get_photo_or_thumb)]

# ========================================================
# main
# ========================================================
urlpatterns = [url(r'^$', landingpage.view),
               url(r'^dashboard/$', dashboard.view),
               url(r'^test$', direct_to_template("runner.html")),
               url(r'^jsi18n/$', JavaScriptCatalog.as_view(),
                   name='javascript-catalog'),
               # ========================================================
               # hooks to non-interactive pages
               # ========================================================
               url(r'^impressum$', direct_to_template("footer/impressum.html")),
               url(r'^privacy$', direct_to_template("footer/privacy.html")),
               url(r'^copyright$', direct_to_template("footer/copyright.html")),
               url(r'^contact/$', footer.contact),
               url(r'^contact/complete/$',
                   direct_to_template("footer/contact-complete.html")),
               url(r'^help$', direct_to_template("footer/help.html")),
               url(r'^team$', direct_to_template("footer/team.html")),
               # Currently disabled, bank account is closed. If hosting is free remove.
               # url(r'^payment$', direct_to_template("footer/payment.html")),
               # ================================================================
               # dialog hooks
               # ================================================================
               url(r'^form/', include(form_patterns)),
               # ================================================================
               # album hooks
               # ================================================================
               url(r'^albums$', dashboard.get),
               url(r'^album/', include(album_patterns)),
               # ================================================================
               # photo hooks
               # ================================================================
               url(r'^photos$', photo.update_multiple),
               url(r'^photo/', include(photo_patterns)),
               # ================================================================
               # place hooks
               # ================================================================
               url(r'^place/', include(place_patterns)),
               # ================================================================
               # user-account hooks
               # ================================================================
               url(r'^account/', include(account_patterns)),
               path('admin/', admin.site.urls)
               # url(r'^accounts/', include(registration)),
               ]

# TODO This does not work
# if "django.contrib.admin" in settings.INSTALLED_APPS:
# Admin raises error if app is not installed.
