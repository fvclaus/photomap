'''
Created on Jun 30, 2012

@author: fredo
'''

from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render_to_response
from pm.model.photo import Photo

from message import success, error 
from pm.form.photo import PhotoInsertForm, PhotoUpdateForm
from django.contrib.auth.decorators import login_required

import logging
import os
from django.forms.models import model_to_dict

logger = logging.getLogger(__name__)

@login_required
def insert(request):
    if request.method == "POST":
        form = PhotoInsertForm(request.POST, request.FILES, auto_id = False)
        if form.is_valid():
            photo = form.save()
            # just closes iframe
            return render_to_response("insert-photo-success.html")
        else:
            # closes iframe and displays error message
            return render_to_response("insert-photo-error.html", {form : form})
    if request.method == "GET":
        form = PhotoInsertForm(auto_id = False)
        place = None
        try:
            place = request.GET["place"]
        except:
            pass
        return render_to_response("insert-photo.html", {"form":form, "place":place})

@login_required
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
        return render_to_response("update-photo.html")

@login_required
def delete(request):
    if request.method == "POST":
        logger.debug("inside delete post")
        try:
            id = request.POST["id"]
            photo = Photo.objects.get(pk = id)
            photo.delete()
            return success()
        except (KeyError, Photo.DoesNotExist), e:
            return error(str(e))
    else:
        logger.debug("form not available yet")
        return HttpResponseBadRequest()
    

        
    

        
    
