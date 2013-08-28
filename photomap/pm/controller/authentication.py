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
from django.template import RequestContext

from pm.form.authentication import LoginForm 
from pm.model.place import Place
from pm.model.photo import Photo

from pm.controller import set_cookie
from pm.controller import landingpage

import logging
import re

logger = logging.getLogger(__name__)

'''
@summary: login receives POST calls from itself and login_error.
login will store the email in the session and redirect to login_error (via GET) if the credentials are wrong.
Otherwise it will redirect to dashboard.
'''
@sensitive_post_parameters("password")
@csrf_protect
def login(request):
    if request.method == "GET":
        return landingpage.view(request)  # render_to_response("login.html", data)
    if request.method == "POST":
        loginform = LoginForm(request.POST)
        redirect_to = request.POST.get("next")
        if not redirect_to or not re.match("/", redirect_to):
            redirect_to = "/dashboard/"
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
                # Store the email in the session to avoid it from showing up in the logs.
                request.session["login_error_email"] = loginform.cleaned_data["email"]
                response = "/account/auth/login/error/?next=" + redirect_to 
                return HttpResponseRedirect(response)
        else:
            response = "/account/auth/login/error/?next=" + redirect_to
            return HttpResponseRedirect(response)

'''
@summary: login_error will attempt to read the email from the session and render a template that sends POSTS to login.
'''
@csrf_protect
def login_error(request):
    if request.method == "GET":
        # Avoid the email from showing up in log files.
        data = {
                "next": request.REQUEST.get("next"),
                "email": request.session.get("login_error_email", default = "")
                }
        request.session["login_error_email"] = ""
        return render_to_response("account/login-error.html", data, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()

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
