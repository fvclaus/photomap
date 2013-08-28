'''
Created on Jun 19, 2013

@author: Marc
'''

from django.http import HttpResponseRedirect, HttpResponseBadRequest
from django.shortcuts import render_to_response 
from django.contrib.auth.decorators import login_required
from django.template import RequestContext, loader
from django.core.mail import send_mail
from django.contrib.sites.models import get_current_site
from django.contrib.auth.views import password_reset, password_reset_confirm

from django.views.decorators.csrf import csrf_protect
from django.template import RequestContext

from django.utils.translation import ugettext as _
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_http_methods, require_GET, require_POST
from django.conf import settings
from django.contrib.auth import logout

from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo

from pm.mail import send_mail

from pm.form.account import UpdatePasswordForm, UpdateEmailForm, DeleteAccountForm, DeleteAccountReasonsForm

from message import success, error, request_fail_error, request_not_allowed_error

import logging

logger = logging.getLogger(__name__)

@csrf_protect
@login_required
@require_GET
def view(request):
    albums = Album.objects.all().filter(user = request.user)
    n_albums = len(albums)
    n_places = 0
    n_photos = 0
    for album in albums:
        places = Place.objects.all().filter(album = album)
        n_places += len(places)
        for place in places:
            n_photos += Photo.objects.filter(place = place).count()
    data = {
            "n_albums": n_albums,
            "n_places": n_places,
            "n_photos": n_photos,
            "is_test_user": is_test_user(request.user) 
            }
    return render_to_response("account/active.html", data, context_instance = RequestContext(request))

@csrf_protect
@sensitive_post_parameters()
@require_POST
@login_required
def update_password(request):
    user = request.user
    if is_test_user(user):
        return request_not_allowed_error()
    form = UpdatePasswordForm(request.POST)
    if form.is_valid():
        old_password = form.cleaned_data["old_password"]
        new_password = form.cleaned_data["new_password"]
        logger.info("Trying to update password of User %d." % user.id)
        if user.check_password(old_password):
            user.set_password(new_password)
            user.save()
            logger.info("User %d password updated." % user.id)
            return success()
        else:
            return request_fail_error()
    else:
        return error(str(form.errors))

@csrf_protect
@login_required
@require_POST
@sensitive_post_parameters("confirm_password")
def update_email(request):
    user = request.user
    if is_test_user(user):
        return request_not_allowed_error()
    form = UpdateEmailForm(request.POST)
    if form.is_valid():
        new_email = form.cleaned_data["new_email"]
        confirm_password = form.cleaned_data["confirm_password"]
        if user.email == new_email:
            return error(_("EMAIL_MATCH_ERROR"))
        logger.info("Trying to update email of User %d." % user.id)
        if user.check_password(confirm_password):
            user.email = new_email
            user.save()
            logger.info("User %d email updated." % user.id)
            return success(email = new_email)
        else:
            return request_fail_error()
    else:
        return error(str(form.errors))
    
@csrf_protect
@login_required
@sensitive_post_parameters("user_password")
def delete(request):
    if request.method == "GET":
        form = DeleteAccountForm()
        return render_to_response("account/delete.html", { "form" : form }, context_instance = RequestContext(request))
    else:
        user = request.user
        form = DeleteAccountForm(request.POST, auto_id = False)
        if form.is_valid():
            user_id = user.id
            user_email = form.cleaned_data["user_email"]
            user_password = form.cleaned_data["user_password"]
            logger.info("Trying to delete User %d." % user_id)
            if (user.email == user_email and user.check_password(user_password)):
                logout(request)
                user.delete()
                try:
                    send_delete_mail(user_email, request)
                    if request.POST.has_key("cause") or request.POST.has_key("cause_message"):
                        message = "Cause %d\nMessage %s" % (request.POST.get("cause", default = "No cause selected."),
                                                        request.POST.get("cause_message", default = "No message entered."))
                        send_mail("Account deleted", message)
                except Exception, e:
                    logger.error(str(e))
                finally:
                    return HttpResponseRedirect("/account/delete/success")
            else:
                form.errors["__all__"] = form.error_class([_("EMAIL_OR_PASSWORD_WRONG")])
                return render_to_response("account/delete.html", { "form" : form }, context_instance = RequestContext(request))
        else:
            return render_to_response("account/delete.html", { "form" : form }, context_instance = RequestContext(request))
            
                
def is_test_user(user):
    return user.email == settings.EMAIL_TEST_USER


def send_mail_to_user(user_email, subject, message):
    send_mail(subject,
              message,
              settings.EMAIL_HOST_USER,
              [user_email]
              )
def send_delete_mail(user_email, request):
    subject = loader.render_to_string("email/delete-account-subject.txt")
    dic = {
           "user": user_email,
           "site_name": get_current_site(request).name
    }
    message = loader.render_to_string("email/delete-account-email.html", dic)
    send_mail_to_user(user_email, subject, message)
def send_thankyou_mail(user_email, request):
    subject = loader.render_to_string("email/delete-account-thankyou-subject.txt")
    dic = {
           "user": user_email,
           "site_name": get_current_site(request).name
    }
    message = loader.render_to_string("email/delete-account-thankyou-email.html", dic)
    send_mail_to_user(user_email, subject, message)

@csrf_protect
def reset_password(request):
    logger.debug("here")
    email = "email/reset-password-email.html"
    subject = "email/reset-password-subject.txt"
    redirect_to = "/account/password/reset/requested"
    return password_reset(request, template_name = "account/reset-password.html", email_template_name = email, subject_template_name = subject, post_reset_redirect = redirect_to)

def reset_password_requested(request):
    return render_to_response("account/reset-password-requested.html", context_instance = RequestContext(request))

@sensitive_post_parameters()
@never_cache
def reset_password_confirm(request, uidb36, token):
    redirect_to = "/account/password/reset/complete"
    return password_reset_confirm(request, uidb36, token, template_name = "account/reset-password-confirm.html", post_reset_redirect = redirect_to)

def reset_password_complete(request):
    return render_to_response("account/reset-password-complete.html", context_instance = RequestContext(request))
    
