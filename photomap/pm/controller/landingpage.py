'''
Created on May 27, 2013

@author: marc
'''

from django.http import HttpResponseBadRequest 
from django.template import RequestContext
from django.shortcuts import render_to_response
import datetime

def get_current(request):
    if request.method == "GET":
        today = datetime.date.today().strftime("%w")
        next = request.GET.get("next")
        return render_to_response("index-main.html", {"day": today, "next": next}, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()
    
def get_guest_current(request):
    if request.method == "GET":
        today = datetime.date.today()
        return render_to_response("album-share-login.html", {"day": today.strftime("%w") }, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()
        
    