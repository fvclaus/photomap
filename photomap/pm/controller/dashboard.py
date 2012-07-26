'''
Created on 21.07.2012

@author: MrPhil
'''

from django.http import HttpResponseRedirect, HttpResponse 
from django.shortcuts import render_to_response
from message import success, error
from pm.model.album import Album
from pm.model.invitation import Invitation
import json
import logging
import decimal


logger = logging.getLogger(__name__)

def view(request):
    if not request.user.is_authenticated():
        return HttpResponseRedirect('/login')
    if request.method == "GET":
        return render_to_response("dashboard.html")

def get(request):
    logger.debug("dashboard: entered view function")
    if request.method == "GET":
        logger.debug("dashboard: entered GET")
        user = request.user
        if not user.is_authenticated():
            error("not authenticated")
        
        logger.debug("dashboard: user authenticated")
        albums = Album.objects.all().filter(user = user) &  Invitation.objects.all().filter(user = request.user)
        if len(albums) == 0:
            error("you don't have any albums")
        
        data = albums.toserializable()
        logger.debug("dashboard: %s", json.dumps(data, cls = DecimalEncoder, indent = 4))
        return HttpResponse(json.dumps(data, cls = DecimalEncoder), content_type = "text/json")
        
        
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)   