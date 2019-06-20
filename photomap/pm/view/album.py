import datetime
import decimal
import json
import logging
import string

from django.contrib.auth import hashers
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext
from django.utils import crypto
from django.views.decorators.http import (require_GET, require_http_methods,
                                          require_POST)

from pm.exception import OSMException
from pm.form.album import (AlbumInsertForm, AlbumPasswordUpdateForm,
                           AlbumUpdateForm)
from pm.models.album import Album
from pm.models.photo import Photo
from pm.models.place import Place
from pm.osm import reversegeocode
from pm.test import data
from pm.view import landingpage, set_cookie, update_used_space

from .message import error, success

SECRET_KEY_POOL = string.ascii_letters + string.digits


logger = logging.getLogger(__name__)


@login_required
@require_POST
def update_password(request, album_id):
    user = request.user
    form = AlbumPasswordUpdateForm(request.POST)
    if form.is_valid():
        try:
            album_id = int(album_id)
            logger.debug("User %d is trying to set new password for Album %d." % (
                request.user.pk, album_id))
            album = Album.objects.get(pk=album_id, user=user)
            password = hashers.make_password(form.cleaned_data["password"])
            album.password = password
            album.save()
            return success()

        except Album.DoesNotExist as e:
            logger.warn("Something unexpected happened: %s" % str(e))
            return error(str(e))
    else:
        return error(str(form.errors))


def demo(request):
    if request.method == "GET":
        demo = User.objects.get(username="demo@keiken.de")
        album = Album.objects.get(user=demo)
        request.session["album_%d" % album.pk] = True
        return redirect("/album/%d/view/%s/" % (album.pk, album.secret))
    else:
        return HttpResponseBadRequest()


def view(request, album_id, secret):
    try:
        album_id = int(album_id)
        album = Album.objects.get(pk=album_id)

        logger.debug(
            "User is trying to access album %d with secret %s." % (album_id, secret))

        if album.secret != secret:
            # TODO better name
            logger.debug("Secret does not match.")
            return render_to_response("album-share-failure.html")

        if request.method == "GET":
            # user owns the album
            if request.user == album.user or request.session.get("album_%d" % album_id):
                return render_to_response("view-album.html",
                                          {"test_photo_mountain": data.TEST_PHOTO_MOUNTAIN,
                                           "test_photo_water": data.TEST_PHOTO_WATER},
                                          context_instance=RequestContext(request))
            # album does not has a password yet
            if not hashers.is_password_usable(album.password):
                logger.debug("Album does not has a password yet.")
                return render_to_response("album-share-failure.html")

            return landingpage.view_album_login(request)
        else:
            password = request.POST["album_password"]

            if hashers.check_password(password, album.password):
                request.session["album_%d" % album_id] = True
                return redirect("/album/%d/view/%s/" % (album_id, album.secret))
            else:
                logger.debug("Password %s is incorrect." % password)
                today = datetime.date.today().strftime("%w")
                return render_to_response("album-share-login.html",
                                          {"password_incorrect_error": "Passwort is not correct.",
                                           "day": today.strftime("%w")})
    except Exception as e:
        logger.info(str(e))
        return render_to_response("album-share-failure.html")


@require_GET
def get(request, album_id):
    try:
        user = request.user
        album_id = int(album_id)

        logger.info("User %s is trying to get Album %d." %
                    (str(request.user), album_id))

        if user.is_anonymous():
            if not request.session.get("album_%d" % album_id):
                return error("You are not authorized to view this album.")
            else:
                album = Album.objects.get(pk=album_id)
        else:
            album = Album.objects.get(user=request.user, pk=album_id)

        data = album.toserializable()
        data["isOwner"] = (album.user == user)
        data["success"] = True

        return HttpResponse(json.dumps(data, cls=DecimalEncoder), content_type="text/json")
    except (KeyError, Album.DoesNotExist) as e:
        return error(str(e))


@login_required
@require_POST
def insert(request):
    # auto_id to false prevents the default prefixes for form fields.
    form = AlbumInsertForm(request.POST, auto_id=False)
    if form.is_valid():
        album = form.save(commit=False)
        logger.info("User %d is trying to insert a new Album." %
                    request.user.pk)
        album.user = request.user
        try:
            album.country = reversegeocode(album.lat, album.lon)
        except OSMException as e:
            logger.warn("Could not resolve %f,%f. Reason: %s" %
                        (album.lat, album.lon, str(e)))
#                return error("osm is temporarily not available. please try again later")
            return error(str(e))
        secret = crypto.get_random_string(length=50)
        # Mark the album as 'not shared', e.g. inactive.
        password = hashers.make_password(None)
        logger.info("Adding secret %s to Album." % secret)
        album.secret = secret
        album.password = password
        album.save()
        logger.info("Album %d inserted." % album.pk)
        return success(id=album.pk, secret=album.secret)
    else:
        return error(str(form.errors))


@login_required
@require_POST
def update(request, album_id):
    form = AlbumUpdateForm(request.POST)
    if form.is_valid():
        album_id = int(album_id)
        album = None
        logger.info("Trying to update Album %d." % album_id)
        try:
            album = Album.objects.get(user=request.user, pk=album_id)
        except Album.DoesNotExist as e:
            logger.warn("Album %d does not exist" % album_id)
            return error(str(e))
        form = AlbumUpdateForm(request.POST, instance=album)
        form.save()
        logger.info("Album %d updated." % album_id)
        return success()
    else:
        return error(str(form.errors))


@login_required
@require_http_methods(["DELETE"])
def delete(request, album_id):
    try:
        album_id = int(album_id)
        logger.info("User %d is trying to delete Album %d." %
                    (request.user.pk, album_id))
        album = Album.objects.get(user=request.user, pk=album_id)
        size = 0
        for place in Place.objects.filter(album=album):
            for photo in Photo.objects.filter(place=place):
                size += photo.size
        album.delete()
        # Free space for user.
        used_space = update_used_space(request.user, -1 * size)
        logger.info("Album %d deleted." % album_id)
        response = success()
        set_cookie(response, "used_space", used_space)
        return response
    except (KeyError, Album.DoesNotExist) as e:
        logger.warn("Something unexpected happened: %s" % str(e))
        return error(str(e))


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)
