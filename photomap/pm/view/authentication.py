'''
Created on Jul 10, 2012

@author: fredo
'''
from django.http import HttpResponseRedirect, HttpResponseBadRequest
from django.shortcuts import render_to_response
from django.contrib.auth import  authenticate, login as auth_login 
from django.contrib.auth.models import User
from django.contrib.auth.backends import ModelBackend
from django.core.validators import email_re
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.translation import ugettext as _
from django.template import RequestContext

from pm.form.authentication import LoginForm 
from pm.model.place import Place
from pm.model.photo import Photo

from pm.view import set_cookie
from pm.view import landingpage

import logging
import re

logger = logging.getLogger(__name__)

@sensitive_post_parameters("password")
@csrf_protect
def login(request):
    if request.method == "GET":
        form = LoginForm()
        # It is important to set next to a sensible default value if not defined so POST can avoid None values later.
        next = request.GET.get("next", default = "/dashboard/")
    else:
        form = LoginForm(request.POST)
        next = request.POST.get("next", default = "/dashboard/")
#        if not next or not re.match("/", next):
#            next = "/dashboard/"
        if form.is_valid():
            user = authenticate(username = form.cleaned_data["email"], password = form.cleaned_data["password"])
            if len(next) == 0:
                next = "/dashboard/"  
            if not (user == None or user.is_anonymous()):
                if user.is_active:
                    auth_login(request, user)
                    response = HttpResponseRedirect(next)
                    set_cookie(response, "quota", user.userprofile.quota)
                    set_cookie(response, "used_space", user.userprofile.used_space)
                    return response
                else:
                    return HttpResponseRedirect("/account/inactive")
            else:
                form.errors["__all__"] = form.error_class([_("CREDENTIALS_ERROR")])
                
  
    return render_to_response("account/login.html", { "form" : form, "next" : next }, context_instance = RequestContext(request))


class EmailBackend(ModelBackend):
    def authenticate(self, username = None, password = None):
        if email_re.search(username):
            try:
                user = User.objects.get(email = username)
                if user.check_password(password):
                    return user
            except User.DoesNotExist:
                return None
        return None

def is_authorized(instance, user):
    if isinstance(instance, Place):
        return instance.album.user == user
    elif isinstance(instance, Photo):
        return instance.place.album.user == user
    else:
        return False
