'''
Created on Jul 10, 2012

@author: fredo
'''

from django.http import HttpResponseRedirect, HttpResponse 
from django.shortcuts import render_to_response
from message import success, error
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
import json
import logging
import decimal


logger = logging.getLogger(__name__)


def view(request):
    if not request.user.is_authenticated():
        return HttpResponseRedirect('/login')
    if request.method == "GET":
        return render_to_response("view-album.html")

def get(request):
    logger.debug("get-album: entered view function")
    if request.method == "GET":
        logger.debug("get-album: entered GET")
        user = request.user
        if not user.is_authenticated():
            error("not authenticated")
            
        logger.debug("get-album: user authenticated")
        albums = Album.objects.all().filter(user = user)
        if len(albums) == 0:
            error("you don't have an album")
        album = albums[0]
        
        data = album.toserializable()
        logger.debug("get-album: %s", json.dumps(data, cls = DecimalEncoder, indent = 4))
        return HttpResponse(json.dumps(data, cls = DecimalEncoder), content_type = "text/json")
        
        
def redirect_to_get(request):
    return HttpResponseRedirect("/get-album")
        
        
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


    
