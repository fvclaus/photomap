'''
Created on Jun 19, 2013

@author: Marc
'''

from django.http import HttpResponseRedirect, HttpResponse, HttpResponseBadRequest 
from django.shortcuts import render_to_response, redirect
from django.contrib.auth.decorators import login_required
from django.template import RequestContext, loader
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.contrib.auth.views import password_reset, password_reset_confirm
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.models import get_current_site
from django.utils.translation import get_language_from_request
from django.utils.translation import ugettext as _
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.conf import settings

from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo

from pm.form.account import UserUpdatePasswordForm, UserUpdateEmailForm, UserDeleteAccountForm, UserDeleteAccountReasonsForm

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
            if user.email == user_email and user.check_password(user_password):
                #don't delete user yet -> first redirect to reasons form and then delete
                #user is still needed in database to check the token!
                #user.delete()
                #logger.info("User %d account deleted." % id)
                token = default_token_generator.make_token(user)
                return HttpResponseRedirect("/account/delete/complete/" + token)
            else:
                return request_fail_error()
        else:
            return error(str(form.errors))
    else:
        return HttpResponseBadRequest()

@csrf_protect
def delete_account_complete(request, token):
    if request.method == "GET":
        user = request.user;
        username = user.email
        if user is not None and default_token_generator.check_token(user, token):
            validlink = True
            user.delete();
            send_delete_mail(username, request)
            logger.info("User %s account deleted." % username)
        else:
            validlink = False
        return render_to_response("account-deleted.html", {"validlink": validlink, "username": username}, context_instance = RequestContext(request))
    if request.method == "POST":
        form = UserDeleteAccountReasonsForm(request.POST)
        if form.is_valid():
            try:
                message = format_message(form.cleaned_data["username"],
                                         form.cleaned_data["cause"],
                                         form.cleaned_data["cause_message"],
                                         form.cleaned_data["optional_message"])
                
                send_mail("Reasons for account deletion",
                          message,
                          settings.EMAIL_HOST_USER,
                          [settings.EMAIL_HOST_USER]
                          )
                send_thankyou_mail(form.cleaned_data["username"], request)
                return HttpResponseRedirect("/") 
            except Exception, e:
                return HttpResponseRedirect("/")
    else:
        return HttpResponseBadRequest()

def format_message(user, reason, message, optional):
    return "Account: %s\nReason: %s\n%s\n Additional Notes: %s" % (user, reason, message, optional)
def send_mail_to_user(user_email, subject, message):
    send_mail(subject,
              message,
              settings.EMAIL_HOST_USER,
              [user_email]
              )
def send_delete_mail(user_email, request):
    path = get_email_path(request)
    subject = loader.render_to_string(path + "delete-account-subject.txt")
    dic = {
           "user": user_email,
           "site_name": get_current_site(request).name
    }
    message = loader.render_to_string(path + "delete-account-email.html", dic)
    send_mail_to_user(user_email, subject, message)
def send_thankyou_mail(user_email, request):
    path = get_email_path(request)
    subject = loader.render_to_string(path + "delete-account-thankyou-subject.txt")
    dic = {
           "user": user_email,
           "site_name": get_current_site(request).name
    }
    message = loader.render_to_string(path + "delete-account-thankyou-email.html", dic)
    send_mail_to_user(user_email, subject, message)
def get_email_path(request):
    email_path = "email/en/"
    lang = get_language_from_request(request)
    if lang == "de":
        email_path = "email/de/"
    return email_path

@csrf_protect
def reset_password(request):
    path = get_email_path(request)
    email = path + "reset-password-email.html"
    subject = path + "reset-password-subject.txt"
    redirect_to = "/account/password/reset/requested"
    return password_reset(request, template_name = "reset-password.html", email_template_name = email, subject_template_name = subject, post_reset_redirect = redirect_to)

def reset_password_requested(request):
    return render_to_response("reset-password-done.html", context_instance = RequestContext(request))

@sensitive_post_parameters()
@never_cache
def reset_password_confirm(request, uidb36, token):
    redirect_to = "/account/password/reset/complete"
    return password_reset_confirm(request, uidb36, token, template_name = "reset-password-confirm.html", post_reset_redirect = redirect_to)

def reset_password_complete(request):
    return render_to_response("reset-password-complete.html", context_instance = RequestContext(request))
    