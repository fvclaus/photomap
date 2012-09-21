'''
Created on Jul 10, 2012

@author: fredo
'''

from django.http import HttpResponseRedirect, HttpResponse, HttpResponseBadRequest 
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib.auth import models

from django.utils import crypto
from django.contrib.auth import hashers

from message import success, error
from pm.test import data
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
from pm.model.share import Share


from pm.osm import reversegecode
from pm.form.album import AlbumInsertForm, AlbumUpdateForm

import json
import logging
import decimal

import os
import string
import random

SECRET_KEY_POOL = string.ascii_letters + string.digits


logger = logging.getLogger(__name__)

@login_required
def share(request):
    if request.method == "GET":
        user = request.user
        try:
            id = request.GET["id"]
            if not id:
                raise KeyError, "invalid id %s" % (str(id))
            album = Album.objects.get(pk = id, user = user)
            shares = Share.objects.all().filter(album = album)
            if len(shares) == 0:
                secret = crypto.get_random_string(length = 50)
                share = Share(album = album, token = secret)
                share.save()
            else:
                share = shares[0]
            return success(url = "/view-album?id=%d&secret=%s" % (share.album.pk, share.token))
        except (KeyError, Album.DoesNotExist), e:
            return error(str(e))
            
    else:
        return HttpResponseBadRequest()

def view(request):
#    if not request.user.is_authenticated():
#        return HttpResponseRedirect('/login')
    if request.method == "GET":
        return render_to_response("view-album.html",
                                  {"testphotopath": data.TEST_PHOTO},
                                  context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()


def get(request):
    logger.debug("get-album: entered view function")
    if request.method == "GET":
        try:
            user = request.user
            
            try:
                id = request.GET["id"]
            except KeyError:
                id = None
                
            if user.is_anonymous():
                secret = request.GET["secret"]
                album = Album.objects.get(pk = id)
                share = Share.objects.get(album = album, token = secret)
                
            # no id -- try to take newest album of this user
            else:
                if not id:
                    albums = Album.objects.all(user = request.user)
                    album = albums[len(albums) - 1]
                else:
                    album = Album.objects.get(user = request.user, pk = id)
                
            data = album.toserializable()
            if album.user == user:
                data["isOwner"] = True
            else:
                data["isOwner"] = False
                
            logger.debug("get-album: %s", json.dumps(data, cls = DecimalEncoder, indent = 4))
            return HttpResponse(json.dumps(data, cls = DecimalEncoder), content_type = "text/json")
        except (KeyError, Album.DoesNotExist, Share.DoesNotExist), e:
            return error(str(e))

    
    else:
        return HttpResponseBadRequest()


@login_required
def insert(request):
    if request.method == "POST":
        form = AlbumInsertForm(request.POST, auto_id = False)
        if form.is_valid():
            album = form.save(commit = False)
            logger.debug("user " + str(request.user))
            album.user = request.user
            try:
                album.country = reversegecode(album.lat, album.lon)
            except:
                return error("osm is temporarily not available. please try again later")
            album.save()
            return success(id = album.pk)
        else:
            return error(str(form.errors))
    else:
        return render_to_response("insert-album.html")

@login_required
def update(request):
    if request.method == "POST":
        form = AlbumUpdateForm(request.POST)
        if form.is_valid():
            album = None
            try:
                album = Album.objects.get(user = request.user, pk = form.cleaned_data["id"])
            except Album.DoesNotExist:
                return error("album does not exist")
            form = AlbumUpdateForm(request.POST, instance = album)
            form.save()
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-album.html")  

@login_required
def delete(request):
    if request.method == "POST":
        logger.debug("inside delete post")
        try:
            id = request.POST["id"]
            album = Album.objects.get(user = request.user, pk = id)
            album.delete()
            return success()
        except (KeyError, Album.DoesNotExist), e:
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


    
