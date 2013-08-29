'''
Created on 21.07.2012

@author: Frederik Claus
'''

from django.http import HttpResponse 
from django.shortcuts import render_to_response
from django.template import RequestContext
from pm.model.album import Album
import json
import logging
import decimal
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET

logger = logging.getLogger(__name__)

@login_required
def view(request):
    if request.method == "GET":
        return render_to_response("dashboard.html", context_instance = RequestContext(request))
    
@login_required
@require_GET
def get(request):
    user = request.user
    logger.debug("User %d is trying to get all albums." % user.id)
    albums = Album.objects.all().filter(user = user) 
    data = []
    
    for album in albums:
        albumflat = album.toserializable(includeplaces = False)
        albumflat["isOwner"] = True
        data.append(albumflat)
    
    return HttpResponse(json.dumps(data, cls = DecimalEncoder), content_type = "text/json")
        
        
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)   
