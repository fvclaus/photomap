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
import logging
import os

logger = logging.getLogger(__name__)

def insert(request):
    if request.method == "POST":
        form = InsertPlaceForm(request.POST)
        if form.is_valid():
            place = form.save()
            return success(id = place.pk)
        else:
            return error(str(form.errors))
    else:
        return render_to_response("insert-place.html")

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
            form = UpdatePlaceForm(request.POST, instance = place)
            form.save()
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-place.html")
            


def delete(request):
    if request.method == "POST":
        try:
            place = Place.objects.get(pk = request.POST["id"])
            photos = Photo.objects.all().filter(place = place)
            place.delete()    
            for photo in photos:
                os.remove(photo.photo.path)
            return success()
        except (OSError, Place.DoesNotExist), e:
            return error(str(e))
        
    
