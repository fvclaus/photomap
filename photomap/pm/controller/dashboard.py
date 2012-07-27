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
from django.contrib.auth.decorators import login_required

logger = logging.getLogger(__name__)

@login_required
def view(request):
    if request.method == "GET":
        return render_to_response("dashboard.html")

@login_required
def get(request):
    logger.debug("dashboard: entered view function")
    if request.method == "GET":
        user = request.user
        albums = Album.objects.all().filter(user = user) 
        data = []
        
        for album in albums:
            albumflat = album.toserializable(includeplaces = False)
            albumflat["isOwner"] = True
            data.append(albumflat)
            
        logger.debug("dashboard: %s", json.dumps(data, cls = DecimalEncoder, indent = 4))
        return HttpResponse(json.dumps(data, cls = DecimalEncoder), content_type = "text/json")
        
        
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)   