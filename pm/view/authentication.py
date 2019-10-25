import logging

from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as django_logout
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
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
    return HttpResponseRedirect(reverse('login'))


@sensitive_post_parameters("password")
@csrf_protect
def login(request):
    if request.method == "GET":
        form = LoginForm()
        # It is important to set next to a sensible default value if not defined so POST can avoid None values later.
        redirect_path = request.GET.get("next", default="/dashboard/")
    else:
        form = LoginForm(request.POST)
        redirect_path = request.POST.get("next", default="")
        if not redirect_path:
            redirect_path = "/dashboard"
        if form.is_valid():
            mail = form.cleaned_data["email"]
            logger.info("Trying to authenticate user %s", mail)
            user = authenticate(
                username=mail, password=form.cleaned_data["password"])
            # Since 1.10, inactive user are not allowed to login anymore.
            if user is not None:
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
                    "Could not authenticate user with given credentials.")
                form.errors["__all__"] = form.error_class(
                    [_("CREDENTIALS_ERROR")])

    return render(request, "account/login.html", {"form": form, "next": redirect_path})


def is_authorized(instance, user):
    if isinstance(instance, Place):
        return instance.album.user == user
    elif isinstance(instance, Photo):
        return instance.place.album.user == user
    else:
        return False
