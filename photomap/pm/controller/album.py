'''
Created on Jul 10, 2012

@author: fredo
'''

from django.http import HttpResponseRedirect, HttpResponse, HttpResponseBadRequest 
from django.shortcuts import render_to_response
from message import success, error
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo

from pm.form.album import AlbumInsertForm, AlbumUpdateForm

import json
import logging
import decimal

import os


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
            error("you don't have any albums")
        album = albums[0]
        
        data = album.toserializable()
        logger.debug("get-album: %s", json.dumps(data, cls = DecimalEncoder, indent = 4))
        return HttpResponse(json.dumps(data, cls = DecimalEncoder), content_type = "text/json")

#TODO solve issue if geo data will be handled within frontend or within the controller unit

def insert(request):
    if request.method == "POST":
        form = AlbumInsertForm(request.POST, auto_id = False)
        if form.is_valid():
            form.save()
            return render_to_response("insert-album-success.html")
        else:
            return render_to_response("insert-album-error.html", {form : form})
   
def update(request):
    if request.method == "POST":
        form = AlbumUpdateForm(request.POST)
        if form.is_valid():
            album = None
            try:
                album = Album.objects.get(pk = form.cleaned_data["id"])
            except Album.DoesNotExist:
                return error("album does not exist")
            form = AlbumUpdateForm(request.POST, instance = album)
            form.save()
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-album.html")  

def delete(request):
    if request.method == "POST":
        logger.debug("inside delete post")
        try:
            id = request.POST["id"]
            album = Album.objects.get(pk = id)
            try:
                os.remove(album.photo.path)
            except OSError:
                pass
            album.delete()
            return success()
        except (KeyError, Photo.DoesNotExist), e:
            return error(str(e))
    else:
        logger.debug("form not available yet")
        return HttpResponseBadRequest()     
        
def redirect_to_get(request):
    return HttpResponseRedirect("/get-album")
        
        
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


    
