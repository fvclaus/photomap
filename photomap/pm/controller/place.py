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
from pm.controller import set_cookie, update_used_space
import os
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST

logger = logging.getLogger(__name__)

@login_required
@require_POST
def insert(request):
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

@login_required
@require_POST
def update(request, id):
    form = UpdatePlaceForm(request.POST)
    if form.is_valid():
        place = None
        try:
            id = int(id)
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
            

@login_required
@require_http_methods(["DELETE"])
def delete(request, id):
    try:
        id = int(id)
        logger.info("User %d is trying to delete Place %d." % (request.user.pk, id))
        place = Place.objects.get(pk = id)
        if not is_authorized(place, request.user):
            logger.warn("User %d not authorized to delete Place %d. Aborting." % (request.user.pk, id))
            return error("not your place")
        size = 0
        for photo in Photo.objects.filter(place = place):
            size += photo.size
        used_space = update_used_space(request.user, -1 * size)
        place.delete()
        logger.info("Place %d deleted." % id)    
        response = success()
        set_cookie(response, "used_space", used_space)
        return response
    except (OSError, Place.DoesNotExist), e:
        return error(str(e))
        
    
