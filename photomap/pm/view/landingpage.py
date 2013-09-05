'''
Created on May 27, 2013

@author: marc
'''

from django.http import HttpResponseBadRequest 
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from pm.form.registration import RegistrationForm

import datetime

@ensure_csrf_cookie
@csrf_protect
def view(request):
    if request.method == "GET":
        today = datetime.date.today().strftime("%w")
        next = request.GET.get("next")
        registration_form = RegistrationForm()
        return render_to_response("index.html", {"day": today, "next": next, "registration_form" : registration_form}, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()
    
    
def view_album_login(request):
    """ Renders the album login for guests. """
    if request.method == "GET":
        today = datetime.date.today()
        return render_to_response("album-share-login.html", {"day": today.strftime("%w") }, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()
        
    