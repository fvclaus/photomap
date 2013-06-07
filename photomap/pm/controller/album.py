'''
Created on Jul 10, 2012

@author: fredo
'''

from django.http import HttpResponseRedirect, HttpResponse, HttpResponseBadRequest 
from django.shortcuts import render_to_response, redirect
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib.auth.models import User


from django.utils import crypto
from django.contrib.auth import hashers

from message import success, error
from pm.test import data
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
from pm.controller import set_cookie, update_used_space
from pm.controller import landingpage
from pm.exception import OSMException

from pm.osm import reversegecode
from pm.form.album import AlbumInsertForm, AlbumUpdateForm, AlbumPasswordUpdateForm, AlbumShareLoginForm

import json
import logging
import decimal

import os
import string
import random

SECRET_KEY_POOL = string.ascii_letters + string.digits


logger = logging.getLogger(__name__)

@login_required
def update_password(request):
    if request.method == "POST":
        user = request.user
        form = AlbumPasswordUpdateForm(request.POST)
        if form.is_valid():
            try:
                album_id = form.cleaned_data["album"]
                logger.debug("User %d is trying to set new password for Album %d." % (request.user.pk, album_id))
                album = Album.objects.get(pk = album_id, user = user)
                password = hashers.make_password(form.cleaned_data["password"])
                album.password = password
                album.save()
                return success()
            
            except (Album.DoesNotExist), e:
                logger.warn("Something unexpected happened: %s" % str(e))
                return error(str(e))
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-album-password.html")

#
#def view(request):
##    if not request.user.is_authenticated():
##        return HttpResponseRedirect('/login')
#    if request.method == "GET":
#        return render_to_response("view-album.html",
#                                  {"testphotopath": data.TEST_PHOTO},
#                                  context_instance = RequestContext(request))
#    else:
#        return HttpResponseBadRequest()


def demo(request):
    if request.method == "GET":
        demo = User.objects.get(username="demo")
        album = Album.objects.get(user = demo)
        request.session["album_%d" % album.pk] = True
        return redirect("/album/view/%s-%d" % (album.secret, album.pk))
    else:
        return HttpResponseBadRequest()

def view(request, secret, album_id):
    try:
        album_id = int(album_id)
        album = Album.objects.get(pk=album_id)
        
        logger.debug("User is trying to access album %d with secret %s." % (album_id, secret))
        
        if album.secret != secret:
            #TODO better name
            logger.debug("Secret does not match.")
            logger.debug("%s is not %s" % (secret, album.secret))
            return render_to_response("album-share-failure.html")
    
        if request.method == "GET":
            # user owns the album
            if request.user == album.user or request.session.get("album_%d" % album_id):
                return render_to_response("view-album.html",
                                  {"test_photo_mountain" : data.TEST_PHOTO_MOUNTAIN,
                                   "test_photo_water" : data.TEST_PHOTO_WATER},
                                  context_instance = RequestContext(request))
            # album does not has a password yet
            if not hashers.is_password_usable(album.password):
                logger.debug("Album does not has a password yet.")
                return render_to_response("album-share-failure.html")
            
            return landingpage.get_guest_current(request)
        else:
            password = request.POST["password"]
            
            if hashers.check_password(password, album.password):
                request.session["album_%d" % album_id] = True
                return redirect("/album/view/%s-%d" % (album.secret, album_id))
            else:
                logger.debug("Password %s is incorrect." % password)
                return render_to_response("album-share-login.html", 
                                          {"password_incorrect_error": "Passwort is not correct.",
                                           "day": today.strftime("%w")})
    except Exception, e:
        logger.info(str(e))
        return render_to_response("album-share-failure.html")



def get(request):
    if request.method == "GET":
        try:
            user = request.user
            album_id = int(request.GET["id"])
            
            
            logger.info("User %s is trying to get Album %d." % (str(request.user), album_id))    
        
            if user.is_anonymous():
                if not request.session.get("album_%d" % album_id):
                    return error("You are not authorized to view this album.")
                else:
                    album  = Album.objects.get(pk = album_id)
            else:
                album = Album.objects.get(user = request.user, pk = album_id)
                
#            # no album_id -- try to take newest album of this user
#            else:
#                if not album_id:
#                    albums = Album.objects.all(user = request.user)
#                    album = albums[len(albums) - 1]
#                    logger.info("No ID has been specified. Returning album %d." % album.pk)
#                else:
#                   

                
            data = album.toserializable()
            if album.user == user:
                data["isOwner"] = True
            else:
                data["isOwner"] = False
                
            data["success"] = True
                
            logger.debug("--------------------------------ALBUM %d--------------------------------------" % album.pk) 
            logger.debug("%s", json.dumps(data, cls = DecimalEncoder, indent = 4))
            logger.debug("------------------------------------------------------------------------------") 
            return HttpResponse(json.dumps(data, cls = DecimalEncoder), content_type = "text/json")
        except (KeyError, Album.DoesNotExist), e:
            return error(str(e))

    
    else:
        return HttpResponseBadRequest()


@login_required
def insert(request):
    if request.method == "POST":
        form = AlbumInsertForm(request.POST, auto_id = False)
        if form.is_valid():
            album = form.save(commit = False)
            logger.info("User %d is trying to insert a new Album." % request.user.pk)
            album.user = request.user
            try:
                album.country = reversegecode(album.lat, album.lon)
            except OSMException, e:
                logger.warn("Could not resolve %f,%f. Reason: %s" % (album.lat, album.lon, str(e)))
#                return error("osm is temporarily not available. please try again later")
                return error(str(e))
            secret = crypto.get_random_string(length = 50)
            password = hashers.make_password(None)
            logger.info("Adding secret %s to Album." % secret)
            album.secret = secret
            album.password = password
            album.save()
            logger.info("Album %d inserted." % album.pk)
            return success(id = album.pk, secret = album.secret)
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
            id = form.cleaned_data["id"]
            logger.info("Trying to update Album %d." % id)
            try:
                album = Album.objects.get(user = request.user, pk = id)
            except Album.DoesNotExist:
                logger.warn("Album %d does not exist" % id)
                return error("album does not exist")
            form = AlbumUpdateForm(request.POST, instance = album)
            form.save()
            logger.info("Album %d updated." % id)
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-album.html")  

@login_required
def delete(request):
    if request.method == "POST":
        try:
            id = int(request.POST["id"])
            logger.info("User %d is trying to delete Album %d." % (request.user.pk, id))
            album = Album.objects.get(user = request.user, pk = id)
            size = 0
            for place in Place.objects.filter(album = album):
                for photo in Photo.objects.filter(place = place):
                    size += photo.size
            album.delete()
            used_space = update_used_space(request.user, -1 * size)
            logger.info("Album %d deleted." % id)
            response =  success()
            set_cookie(response, "used_space", used_space)
            return response
        except (KeyError, Album.DoesNotExist), e:
            logger.warn("Something unexpected happened: %s" % str(e))
            return error(str(e))
    else:
        return render_to_response("delete-album.html")
        
def redirect_to_get(request):
    return HttpResponseRedirect("/get-album")
        
        
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


    
