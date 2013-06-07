'''
Created on May 27, 2013

@author: harry_potter
'''

from django.http import HttpResponseBadRequest 
from django.shortcuts import render_to_response
import datetime

def get_current(request):
    if request.method == "GET":
        today = datetime.date.today()
        return render_to_response("index-main.html", {"day": today.strftime("%w") })
    else:
        return HttpResponseBadRequest()
    
def get_guest_current(request):
    if request.method == "GET":
        today = datetime.date.today()
        return render_to_response("album-share-login.html", {"day": today.strftime("%w") })
    else:
        return HttpResponseBadRequest()

def get_login(request, data):
    if request.method == "GET":
        today = datetime.date.today()
        data["next"] = request.GET.get("next")
        data["day"] = today.strftime("%w")
        return render_to_response("index-main.html", data)
    else:
        return HttpResponseBadRequest()
    