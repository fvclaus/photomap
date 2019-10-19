import logging
import os

import django.contrib.auth.views as authviews
from django.conf import settings
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import mail_managers, send_mail
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.template import loader
from django.utils.translation import ugettext as _
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.http import require_GET
from pm.form.account import DeleteAccountForm
from pm.models.album import Album
from pm.models.photo import Photo
from pm.models.place import Place

logger = logging.getLogger(__name__)


@csrf_protect
@login_required
@require_GET
def view(request):
    albums = Album.objects.all().filter(user=request.user)
    n_albums = len(albums)
    n_places = 0
    n_photos = 0
    for album in albums:
        places = Place.objects.all().filter(album=album)
        n_places += len(places)
        for place in places:
            n_photos += Photo.objects.filter(place=place).count()
    data = {"n_albums": n_albums,
            "n_places": n_places,
            "n_photos": n_photos,
            "is_test_user": is_test_user(request.user)}
    return render(request, "account/active.html", data)


@csrf_protect
@login_required
@sensitive_post_parameters("user_password")
def delete(request):
    form = DeleteAccountForm()

    if request.method == "POST":
        user = request.user
        form = DeleteAccountForm(request.POST, auto_id=False)
        if is_test_user(request.user):
            form.errors["__all__"] = form.error_class(
                [_("REQUEST_NOT_ALLOWED_ERROR")])
        elif form.is_valid():
            user_id = user.id
            user_email = form.cleaned_data["user_email"]
            user_password = form.cleaned_data["user_password"]
            logger.info("Trying to delete User %d." % user_id)
            if (user.username == user_email and user.check_password(user_password)):
                logout(request)
                user.delete()
                try:
                    send_delete_mail(user_email, request)
                    if "cause" in request.POST or "cause_message" in request.POST:
                        message = "Cause: %s\nMessage: %s" % (request.POST.get("cause", default="No cause selected."),
                                                              request.POST.get("cause_message", default="No message entered."))
                        mail_managers("Account deleted", message)
                except Exception as e:
                    logger.error(str(e))
                finally:
                    return HttpResponseRedirect("/account/delete/complete/")
            else:
                form.errors["__all__"] = form.error_class(
                    [_("CREDENTIALS_ERROR")])

    return render(request, "account/delete.html", {"form": form})


def is_test_user(user):
    return user.username == settings.TEST_USER_EMAIL


def send_mail_to_user(user_email, subject, message):
    # TODO sender is not passed through send_mail correctly.
    send_mail(subject,
              message,
              os.environ["EMAIL_FROM"],
              [user_email])


def send_delete_mail(user_email, request):
    subject = loader.render_to_string("email/delete-account-subject.txt")
    dic = {"user": user_email,
           "site_name": get_current_site(request).name}
    message = loader.render_to_string("email/delete-account-email.html", dic)
    send_mail_to_user(user_email, subject, message)


def send_thankyou_mail(user_email, request):
    subject = loader.render_to_string(
        "email/delete-account-thankyou-subject.txt")
    dic = {"user": user_email,
           "site_name": get_current_site(request).name}
    message = loader.render_to_string(
        "email/delete-account-thankyou-email.html", dic)
    send_mail_to_user(user_email, subject, message)


class PasswordChangeView(authviews.PasswordChangeView):
    pass
