'''
Created on Jun 19, 2013

@author: Marc
'''

from django.http import HttpResponseRedirect, HttpResponse, HttpResponseBadRequest 
from django.shortcuts import render_to_response, redirect
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib.auth.models import User
from django.contrib.auth.views import password_reset, password_reset_confirm
from django.utils.translation import get_language_from_request
from django.utils.translation import ugettext as _
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect

from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo

from pm.form.account import UserUpdatePasswordForm, UserUpdateEmailForm, UserDeleteAccountForm

from message import success, error, request_fail_error, request_not_allowed_error

import logging

logger = logging.getLogger(__name__)

@csrf_protect
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
        return render_to_response("account-active.html", data, context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()

@sensitive_post_parameters()
@csrf_protect
@login_required
def update_password(request):
    if request.method == "GET":
        return view(request)
    if request.method == "POST":
        form = UserUpdatePasswordForm(request.POST)
        if form.is_valid():
            user = request.user
            if user.email == "test@keiken.app":
                return request_not_allowed_error()
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
                return request_fail_error()
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()

@sensitive_post_parameters("confirm_password")
@csrf_protect
@login_required
def update_email(request):
    if request.method == "GET":
        return view(request)
    if request.method == "POST":
        form = UserUpdateEmailForm(request.POST)
        if form.is_valid():
            user = request.user
            if user.email == "test@keiken.app":
                return request_not_allowed_error()
            new_email = request.POST.get("new_email")
            confirm_password = request.POST.get("confirm_password")
            if user.email == new_email:
                return error(_("EMAIL_MATCH_ERROR"))
            logger.info("Trying to update email of User %d." % user.id)
            if user.check_password(confirm_password):
                user.email = new_email
                user.save()
                logger.info("User email updated. New email = %s" % new_email)
                return success(email = new_email)
            else:
                return request_fail_error()
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()

@csrf_protect
@login_required
def delete_account(request):
    if request.method == "GET":
        return view(request)
    if request.method == "POST":
        form = UserDeleteAccountForm(request.POST)
        if form.is_valid():
            user = request.user
            id = user.id
            if user.email == "test@keiken.app":
                return request_not_allowed_error()
            user_email = request.POST.get("user_email")
            user_password = request.POST.get("user_password")
            logger.info("Trying to delete User %d." % id)
            if user.check_password(user_password):
                user.delete()
                logger.info("User %d account deleted." % id)
                return HttpResponseRedirect("/")
            else:
                return request_fail_error()
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()

@csrf_protect
def reset_password(request):
    lang = get_language_from_request(request)
    if lang != "de" and lang != "en":
        lang = "en"
    email = "email/" + lang + "/reset-password-email.html"
    subject = "email/" + lang + "/reset-password-subject.txt"
    redirect_to = "/account/reset-password/done"
    return password_reset(request, template_name = "reset-password.html", email_template_name = email, subject_template_name = subject, post_reset_redirect = redirect_to)

def reset_password_done(request):
    return render_to_response("reset-password-done.html", context_instance = RequestContext(request))

@sensitive_post_parameters()
@never_cache
def reset_password_confirm(request, uidb36, token):
    redirect_to = "/account/reset-password/complete"
    return password_reset_confirm(request, uidb36, token, template_name = "reset-password-confirm.html", post_reset_redirect = redirect_to)

def reset_password_complete(request):
    return render_to_response("reset-password-complete.html", context_instance = RequestContext(request))
    