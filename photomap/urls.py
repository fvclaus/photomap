from django.urls import include, path
from django.conf.urls import url

from pm.views import direct_to_template

from pm.view import album, place, photo
from pm.view import dashboard
from pm.view import footer
from pm.view import landingpage
from pm.view import authentication
from pm.view import account
from pm.view import registration

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


def method_mapper(regex, controller_name, get=None, post=None, put=None, delete=None, head=None, options=None, trace=None):
    handlers = {GET: get, POST: post, PUT: put, DELETE: delete, HEAD: head, OPTIONS: options, TRACE: trace}
    return url(regex, dispatch, handlers, controller_name)


# ================================================================
# user-account hooks
# ================================================================

# TODO Convert to new path API: https://docs.djangoproject.com/en/2.1/releases/2.0/#simplified-url-routing-syntax
account_password_patterns = [path(r'^$', "update_password"),  # accepts only POST
                             url(r'^reset$', account.reset_password),
                             url(r'^reset/requested$', account.reset_password_requested),
                             url(r'^reset/confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)$', account.reset_password_confirm, name="reset_password_confirm"),
                             url(r'^reset/complete$', account.reset_password_complete)]

account_patterns = [method_mapper(r'^$', account.account, get=account.view, delete=account.delete),
                    url(r'^delete$', account.delete),
                    # url(r'^auth/', include(auth_patterns)),
                    url(r'^inactive$', direct_to_template("account/inactive.html")),
                    url(r'^password/', include(account_password_patterns)),
                    url(r'^email/$', account.update_email),  # accepts only POST
                    url(r'^delete/complete/$', direct_to_template("account/delete-complete.html"))]

account_patterns += [url(r'^login/$', authentication.login),
                     url(r'^logout/$', authentication.logout, {"next_page": "/"})]

account_patterns += [url(r'^activate/complete/$',
                     direct_to_template('account/activation-complete.html')),
                     # Activation keys get matched by \w+ instead of the more specific
                     # [a-fA-F0-9]{40} because a bad activation key should still get to the view;
                     # that way it can return a sensible "invalid key" message instead of a
                     # confusing 404.
                     url(r'^activate/(?P<activation_key>\w+)/$',
                         registration.ActivationView.as_view(),
                         # {'backend': registration_backend,
                         #  "template_name": "account/activation-error.html"},
                         name='registration_activate'),
                     url(r'^register/$',
                         registration.RegistrationView.as_view(),
                         # {'backend': registration_backend,
                         #  "template_name": "account/registration.html"},
                         name='registration_register'),
                     url(r'^register/complete/$',
                         direct_to_template('account/registration-complete.html'),
                         name='registration_complete'),
                     url(r'^register/closed/$',
                         direct_to_template('account/registration-closed.html'),
                         name='registration_disallowed'),
                     (r'', include('registration.auth_urls'))]
# ================================================================
# dialog hooks
# ================================================================
form_patterns = [url(r'^insert/album$', direct_to_template("form/insert/album.html")),
                 url(r'^insert/place$', direct_to_template("form/insert/place.html")),
                 url(r'^insert/photo$', photo.get_insert_dialog),
                 url(r'^update/model$', direct_to_template("form/update/model.html")),
                 url(r'^update/album/password$', direct_to_template("form/update/album-password.html")),
                 url(r'^update/photos$', direct_to_template("form/update/photos.html")),
                 url(r'^delete/model$', direct_to_template("form/delete/model.html"))]
# ================================================================
# album hooks
# ================================================================
album_patterns = [url(r'^$', album.insert),  # accepts only POST
                  method_mapper(r'^(?P<album_id>\d+)/$', album.album, get=album.get, post=album.update, delete=album.delete),
                  url(r'^(?P<album_id>\d+)/view/(?P<secret>.+)/$', album.view),
                  url(r'^(?P<album_id>\d+)/password$', album.update_password),  # accepts only POST
                  url(r'^demo$', album.demo)]
# ================================================================
# place hooks
# ================================================================
place_patterns = [url(r'^$', place.insert),  # accepts only POST
                  method_mapper(r'^(?P<place_id>\d+)/$', place.place, post=place.update, delete=place.delete)]
# ================================================================
# photo hooks
# ================================================================
photo_patterns = [url(r'^$', photo.insert),  # accepts only POST
                  method_mapper(r'^(?P<photo_id>\d+)/$', photo.photo, post=photo.update, delete=photo.delete)]

# ========================================================
# main
# ========================================================
urlpatterns = [url(r'^$', landingpage.view),
               url(r'^dashboard/$', dashboard.view),
               url(r'^test$', direct_to_template("runner.html")),
               url(r'^jsi18n/$', 'django.views.i18n.javascript_catalog'),
               # ========================================================
               # hooks to non-interactive pages
               # ========================================================
               url(r'^impressum$', direct_to_template("footer/impressum.html")),
               url(r'^privacy$', direct_to_template("footer/privacy.html")),
               url(r'^copyright$', direct_to_template("footer/copyright.html")),
               url(r'^contact/$', footer.contact),
               url(r'^contact/complete/$', direct_to_template("footer/contact-complete.html")),
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
               # url(r'^accounts/', include(registration)),
               ]

# TODO This does not work
# if "django.contrib.admin" in settings.INSTALLED_APPS:
#     # Admin raises error if app is not installed.
#     urlpatterns += url(r'^admin/', include(admin.site.urls))
