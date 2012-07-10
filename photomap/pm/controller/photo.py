'''
Created on Jun 30, 2012

@author: fredo
'''

from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render_to_response
from pm.model.photo import Photo

from message import success, error 
from pm.form.photo import PhotoInsertForm, PhotoUpdateForm

import logging
import os
logger = logging.getLogger(__name__)

# TODO: maybe this can be abstracted by using middleware that checks for the existence of an error string and renders the error message
def insert(request):
    if request.method == "POST":
        form = PhotoInsertForm(request.POST, request.FILES, auto_id = False)
        if form.is_valid():
            photo = form.save()
            return success(id = photo.pk)
        else:
            return error(str(form.errors))
    if request.method == "GET":
        form = PhotoInsertForm(auto_id = False)
        place = None
        try:
            place = request.GET["place"]
        except:
            pass
        return render_to_response("insert-photo.html", {"form":form, "place":place})
    
def update(request):
    if request.method == "POST":
        form = PhotoUpdateForm(request.POST)
        if form.is_valid():
            photo = None
            try:
                photo = Photo.objects.get(pk = form.cleaned_data["id"])
            except Photo.DoesNotExist:
                return error("photo does not exist")
            form = PhotoUpdateForm(request.POST, instance = photo)
            form.save()
            return success()
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()
    
def delete(request):
    if request.method == "POST":
        logger.debug("inside delete post")
        try:
            id = request.POST["id"]
            photo = Photo.objects.get(pk = id)
            try:
                os.remove(photo.photo.path)
            except OSError:
                pass
            photo.delete()
            return success()
        except (KeyError, Photo.DoesNotExist), e:
            return error(str(e))
    else:
        logger.debug("form not available yet")
        return HttpResponseBadRequest()
    

        
    

        
    
