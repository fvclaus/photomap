import datetime

from django.http import HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from pm.form.registration import RegistrationForm


@ensure_csrf_cookie
@csrf_protect
def view(request):
    if request.method == "GET":
        today = datetime.date.today().strftime("%w")
        next = request.GET.get("next")
        registration_form = RegistrationForm()
        return render(request, "index.html", {"day": today, "next": next, "registration_form": registration_form})
    else:
        return HttpResponseBadRequest()


def view_album_login(request):
    """ Renders the album login for guests. """
    if request.method == "GET":
        today = datetime.date.today()
        return render(request, "album-share-login.html", {"day": today.strftime("%w")})
    else:
        return HttpResponseBadRequest()
