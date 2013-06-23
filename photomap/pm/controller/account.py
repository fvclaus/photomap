'''
Created on Jun 19, 2013

@author: Marc
'''

from django.http import HttpResponseRedirect, HttpResponse, HttpResponseBadRequest 
from django.shortcuts import render_to_response, redirect
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib.auth.models import User
from django.contrib.auth.views import password_reset

from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo

from pm.form.account import UserUpdatePasswordForm, UserUpdateEmailForm, UserDeleteAccountForm, UserForgotPasswordForm

from message import success, error

import logging

logger = logging.getLogger(__name__)

@login_required
def view(request):
    if request.method == "GET":
        albums = Album.objects.all().filter(user = request.user)
        total_albums = len(albums)
        total_places = 0
        total_photos = 0
        for album in albums:
            places = Place.objects.all().filter(album = album)
            total_places += len(places)
            for place in places:
                total_photos += Photo.objects.filter(place = place).count()
        data = {
                "total_albums": total_albums,
                "total_places": total_places,
                "total_photos": total_photos
                }
        return render_to_response("account.html", data, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()
    
@login_required
def update_password(request):
    if request.method == "GET":
        return view(request)
    if request.method == "POST":
        form = UserUpdatePasswordForm(request.POST)
        if form.is_valid():
            user = request.user
            old_password = request.POST.get("old_password")
            new_password = request.POST.get("new_password")
            new_password_repeat = request.POST.get("new_password_repeat")
            logger.info("Trying to update password of User %d." % user.id)
            if user.check_password(old_password) and new_password == new_password_repeat:
                user.set_password(new_password)
                user.save()
                logger.info("User %d password updated." % user.id)
                return success()
            else:
                return error("Error changing the password. Please try again!")
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()
    
@login_required
def update_email(request):
    if request.method == "GET":
        return view(request)
    if request.method == "POST":
        form = UserUpdateEmailForm(request.POST)
        if form.is_valid():
            user = request.user
            new_email = request.POST.get("new_email")
            confirm_password = request.POST.get("confirm_password")
            logger.info("Trying to update email of User %d." % user.id)
            if user.check_password(confirm_password):
                user.email = new_email
                user.save()
                logger.info("User email updated. New email = %s" % new_email)
                return success(email = new_email)
            else:
                return error("Error changing the email. Please try again!")
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()
    
@login_required
def delete_account(request):
    if request.method == "GET":
        return view(request)
    if request.method == "POST":
        form = UserDeleteAccountForm(request.POST)
        if form.is_valid():
            user = request.user
            user_email = request.POST.get("user_email")
            user_password = request.POST.get("user_password")
            logger.info("Trying to delete User %d." % user.id)
            if user.check_password(user_password):
                user.delete()
                logger.info("User %d account deleted." % id)
                return success()
            else:
                return error("Error deleting the account. Please try again!")
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()
    
def password_reset(request):
    if request.method == "GET":
        return password_reset(request)
    else:
        return HttpResponseBadRequest()
    