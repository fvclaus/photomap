import logging

from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as django_logout
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import ugettext as _
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters

from pm.form.authentication import LoginForm
from pm.models.photo import Photo
from pm.models.place import Place
from pm.view import set_cookie

logger = logging.getLogger(__name__)


@csrf_protect
def logout(request):
    django_logout(request)
    return render(request, "account/login.html")


@sensitive_post_parameters("password")
@csrf_protect
def login(request):
    if request.method == "GET":
        form = LoginForm()
        # It is important to set next to a sensible default value if not defined so POST can avoid None values later.
        redirect_path = request.GET.get("next", default="/dashboard/")
    else:
        form = LoginForm(request.POST)
        redirect_path = request.POST.get("next", default="/dashboard/")
        if form.is_valid():
            mail = form.cleaned_data["email"]
            logger.info("Trying to authenticate user %s", mail)
            user = authenticate(
                username=mail, password=form.cleaned_data["password"])
            if user is not None:
                if user.is_active:
                    logger.info(
                        "User credentials are valid. Redirecting to %s", redirect_path)
                    auth_login(request, user)
                    response = HttpResponseRedirect(redirect_path)
                    set_cookie(response, "quota", user.userprofile.quota)
                    set_cookie(response, "used_space",
                               user.userprofile.used_space)
                    return response
                else:
                    logger.info(
                        "User is inactive. Redirecting to inactive page.")
                    return HttpResponseRedirect("/account/inactive")
            else:
                logger.info(
                    "Could not authenticate user with given credentials.")
                form.errors["__all__"] = form.error_class(
                    [_("CREDENTIALS_ERROR")])

    return render(request, "account/login.html", {"form": form, "next": redirect_path})


def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


class EmailBackend(ModelBackend):
    def authenticate(self, username=None, password=None):
        if is_valid_email(username):
            try:
                user = User.objects.get(email=username)
                if user.check_password(password):
                    return user
            except User.DoesNotExist:
                return None
        return None


def is_authorized(instance, user):
    if isinstance(instance, Place):
        return instance.album.user == user
    elif isinstance(instance, Photo):
        return instance.place.album.user == user
    else:
        return False
