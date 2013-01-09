'''
Created on Jul 8, 2012

@author: fredo
'''

from django.http import HttpResponseBadRequest
from django.shortcuts import render_to_response
from message import success, error
from pm.form.place import InsertPlaceForm, UpdatePlaceForm
from pm.model.place import Place
from pm.model.photo import Photo
from pm.controller.authentication import is_authorized
import logging
import os
from django.contrib.auth.decorators import login_required

logger = logging.getLogger(__name__)

@login_required
def insert(request):
    if request.method == "POST":
        form = InsertPlaceForm(request.POST)
        if form.is_valid():
            logger.info("User %d is trying to insert a new Place." % request.user.pk)
            if not form.cleaned_data["album"].user == request.user:
                logger.warn("User %d not authorized to insert a new Place in Album %d. Aborting." % (request.user.pk, form.cleaned_data["album"].pk))
                return error("not your album")
            place = form.save()
            logger.info("Place %d inserted." % place.pk)
            return success(id = place.pk)
        else:
            return error(str(form.errors))
    else:
        return render_to_response("insert-place.html")

@login_required
def update(request):
    if request.method == "POST":
        form = UpdatePlaceForm(request.POST)
        if form.is_valid():
            place = None
            try:
                id = form.cleaned_data["id"]
                logger.debug("User %d is trying to update Place %d." % (request.user.pk, id))
                place = Place.objects.get(pk = id)
            except Place.DoesNotExist: 
                logger.warn("Place %d does not exist.", id)
                return error("place does not exist")
            if not is_authorized(place, request.user):
                logger.warn("User %d not authorized to update Place %d. Aborting." % (request.user.pk, id))
                return error("not your place")
            form = UpdatePlaceForm(request.POST, instance = place)
            form.save()
            logger.info("Place %d updated." % id)
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-place.html")
            

@login_required
def delete(request):
    if request.method == "POST":
        try:
            id = int(request.POST["id"])
            logger.info("User %d is trying to delete Place %d." % (request.user.pk, id))
            place = Place.objects.get(pk = id)
            if not is_authorized(place, request.user):
                logger.warn("User %d not authorized to delete Place %d. Aborting." % (request.user.pk, id))
                return error("not your place")
            logger.info("Place %d deleted." % id)
            place.delete()    
            return success()
        except (OSError, Place.DoesNotExist), e:
            return error(str(e))
        
    
