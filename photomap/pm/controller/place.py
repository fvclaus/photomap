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
            if not form.cleaned_data["album"].user == request.user:
                return error("not your album")
            place = form.save()
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
                logger.debug("updating place %d", form.cleaned_data["id"])
                place = Place.objects.get(pk = form.cleaned_data["id"])
            except Place.DoesNotExist: 
                logger.warn("place %d does not exist", form.cleaned_data["id"])
                return error("place does not exist")
            if not is_authorized(place, request.user):
                return error("not your place")
            form = UpdatePlaceForm(request.POST, instance = place)
            form.save()
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-place.html")
            

@login_required
def delete(request):
    if request.method == "POST":
        try:
            place = Place.objects.get(pk = request.POST["id"])
            if not is_authorized(place, request.user):
                return error("not your place")
            place.delete()    

            return success()
        except (OSError, Place.DoesNotExist), e:
            return error(str(e))
        
    
