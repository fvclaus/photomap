import datetime
import logging
import string

from django.conf import settings
from django.contrib.auth import authenticate, hashers, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils import crypto
from django.views.decorators.http import (require_GET, require_http_methods,
                                          require_POST)
from django.views.defaults import page_not_found
from pm.form.album import (AlbumInsertForm, AlbumPasswordUpdateForm,
                           AlbumUpdateForm)
from pm.models.album import Album
from pm.models.photo import Photo
from pm.models.place import Place
from pm.models.user import User
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


@require_GET
def demo(request):
    demo = User.objects.get(email=settings.DEMO_USER_EMAIL)
    album = Album.objects.get(user=demo)
    request.session["album_%d" % album.pk] = True
    return redirect("/album/%d/view/%s/" % (album.pk, album.secret))


@require_GET
def login_test_user(request):
    user = authenticate(request, email=settings.TEST_USER_EMAIL,
                        password=settings.TEST_USER_PASSWORD)
    if user is not None:
        login(request, user)
        return redirect('dashboard')
    else:
        return page_not_found(request, 'Test user not found')


@require_http_methods(["GET", "POST"])
def view(request, album_id, secret):
    try:
        album_id = int(album_id)
        album = Album.objects.get(pk=album_id)

        logger.debug(
            "User is trying to access album %d with secret %s." % (album_id, secret))

        if album.secret != secret:
            logger.debug("Secret does not match.")
            return render(request, "album-share-failure.html")

        if request.method == "GET":
            # user owns the album
            if request.user == album.user or request.session.get("album_%d" % album_id):
                return render(request, "view-album.html")
            if not hashers.is_password_usable(album.password):
                logger.debug("Album does not has a password yet.")
                return render(request, "album-share-failure.html")

            return landingpage.view_album_login(request)
        else:
            password = request.POST["album_password"]

            if hashers.check_password(password, album.password):
                request.session["album_%d" % album_id] = True
                return redirect("/album/%d/view/%s/" % (album_id, album.secret))
            else:
                logger.debug("Password %s is incorrect." % password)
                today = datetime.date.today().strftime("%w")
                return render(request, "album-share-login.html",
                              {"password_incorrect_error": "Passwort is not correct.",
                               "day": today.strftime("%w")})
    except Exception as e:
        logger.info(str(e))
        return render(request, "album-share-failure.html")


@require_GET
def get(request, album_id):
    try:
        user = request.user
        album_id = int(album_id)

        logger.info("User %s is trying to get Album %d." %
                    (user.id, album_id))

        album = Album.objects.get(pk=album_id)

        if album.user.id is not user.id and not request.session.get("album_%d" % album_id):
            return error("You are not authorized to view this album.")
        else:
            return success(album, isowner=album.user == user)
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
        secret = crypto.get_random_string(length=50)
        # Mark the album as 'not shared', e.g. inactive.
        password = hashers.make_password(None)
        logger.info("Adding secret %s to Album." % secret)
        album.secret = secret
        album.password = password
        album.save()
        logger.info("Album %d inserted." % album.pk)
        return success(album, isowner=True)
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
