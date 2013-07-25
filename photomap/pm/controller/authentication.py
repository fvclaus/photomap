'''
Created on Jul 10, 2012

@author: fredo
'''
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseBadRequest
from django.shortcuts import render_to_response
from django.contrib.auth import  authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User, check_password
from django.contrib.auth.backends import ModelBackend
from django.core.validators import email_re
from django.core import serializers
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.template import RequestContext

from pm.form.authentication import LoginForm, RegisterForm
from pm.model.place import Place
from pm.model.photo import Photo
from pm.util.json import JSONResponse

from pm.controller import set_cookie
from pm.controller import landingpage
from pm.controller.message import success, request_fail_error, user_inactive_error, form_invalid_error

import logging
import re

logger = logging.getLogger(__name__)

@sensitive_post_parameters("password")
@csrf_protect
def login(request):
    if request.method == "GET":
        return landingpage.get_current(request) #render_to_response("login.html", data)
    if request.method == "POST":
        loginform = LoginForm(request.POST)
        redirect_to = request.POST.get("next")
        if not redirect_to or not re.match("/",redirect_to):
            redirect_to = "/dashboard"
        if loginform.is_valid():
            user = authenticate(username = loginform.cleaned_data["email"], password = loginform.cleaned_data["password"])
            if not (user == None or user.is_anonymous()):
                if user.is_active:
                    auth_login(request, user)
                    response = HttpResponseRedirect(redirect_to)
                    set_cookie(response, "quota", user.userprofile.quota)
                    set_cookie(response, "used_space", user.userprofile.used_space)
                    return response
                else:
                    return HttpResponseRedirect("/account/inactive")
            else:
                response = "/account/auth/login/error/?next=" + redirect_to + "&email=" + loginform.cleaned_data["email"]
                return HttpResponseRedirect(response)
        else:
            response = "/account/auth/login/error/?next=" + redirect_to
            return HttpResponseRedirect(response)

@csrf_protect
def login_error(request):
    if request.method == "GET":
        data = {
                "next": request.REQUEST.get("next"),
                "email": request.REQUEST.get("email")
                }
        return render_to_response("login-error.html", data, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()

def logout(request):
    auth_logout(request)
    return HttpResponseRedirect("/")

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
        if instance.album.user == user:
            return True
        else:
            return False
    elif isinstance(instance, Photo):
        if instance.place.album.user == user:
            return True
        else:
            return False
    else:
        return False
