import json
import logging
import uuid
from io import BytesIO

from django.contrib.auth.decorators import login_required
from django.http.response import HttpResponse
from django.shortcuts import render
from django.views.decorators.http import (require_GET, require_http_methods,
                                          require_POST)
from PIL import Image, ImageFile
from pm.form.photo import (MultiplePhotosUpdateForm, PhotoCheckForm,
                           PhotoInsertForm, PhotoUpdateForm)
from pm.models.photo import Photo
from pm.view import set_cookie, update_used_space
from pm.view.authentication import is_authorized

from .message import error, success

ImageFile.MAXBLOCK = 2 ** 20

logger = logging.getLogger(__name__)

LONGEST_SIDE_THUMB = 100
LONGEST_SIDE = 1200


def get_size(original):
    return len(original)


def calculate_size(longest_side, other_side, limit):
    resize_factor = limit / float(longest_side)
    return (limit, int(resize_factor * other_side))


def resize(size, limit):
    if size[0] >= size[1]:
        size = calculate_size(size[0], size[1], limit)
    else:
        size = calculate_size(size[1], size[0], limit)
    return size


def create_thumb(buf):
    image = Image.open(buf)
    size = image.size
    thumb = BytesIO()

    thumb_size = resize(size, LONGEST_SIDE_THUMB)

    logger.debug("Resizing thumbnail to %s." % str(thumb_size))
    image.resize(thumb_size).save(thumb, "JPEG", optimize=True)
    thumb.seek(0)

    if size[0] > LONGEST_SIDE or size[1] > LONGEST_SIDE:
        original_size = resize(size, LONGEST_SIDE)
        logger.debug("Resizing photo to %s." % str(original_size))
        image = image.resize(original_size)

    original = BytesIO()
    image.save(original, "JPEG", quality=80,
               optimize=True, progressive=True)
    original.seek(0)
    return original.getvalue(), thumb.getvalue()


@login_required
@require_POST
def insert(request):
    logger.info("Request files %s; Request post %s" %
                (request.FILES, request.POST))
    form = PhotoCheckForm(request.POST, request.FILES, auto_id=False)

    if form.is_valid():
        place = form.cleaned_data["place"]
        logger.info("User %d is trying to insert a new Photo into Place %d." % (
            request.user.pk, place.pk))
        # ===================================================================
        # check place
        # ===================================================================
        if not is_authorized(place, request.user):
            logger.warn("User %s not authorized to insert a new Photo in Place %d. Aborting." % (
                request.user, place.pk))
            return error("This is not your place!")
        # ===================================================================
        # check & convert image
        # ===================================================================
        try:
            original, thumb = create_thumb(request.FILES["photo"])
        except Exception as e:
            logger.error("Could not create thumb. Reason: %s", str(e))
            return error(str(e))
        # ===================================================================
        # check upload limit
        # ===================================================================
        size = get_size(original)
        userprofile = request.user.userprofile
        if userprofile.used_space + size > userprofile.quota:
            return error("No more space left. Delete or resize some older photos.")

        photo = Photo(**form.cleaned_data, order=0, size=size)

        # Necessary to avoid "multiple values for argument" error
        photo.photo = original
        photo.thumb = thumb

        userprofile.used_space += photo.size

        userprofile.save()
        photo.save()
        logger.info("Photo %d inserted with order %d and size %d." %
                    (photo.pk, photo.order, photo.size))

        response = success(photo)
        set_cookie(response, "used_space", userprofile.used_space)
        return response
    else:
        return error(str(form.errors))


@require_GET
def get_photo_or_thumb(request, photo_id):
    photo = Photo.objects.get(pk=uuid.UUID(photo_id))
    if 'thumb' in request.path:
        image = photo.thumb
    elif 'photo' in request.path:
        image = photo.photo
    else:
        raise ValueError("Unrecognized path %s" % (request.path, ))
    return HttpResponse(bytes(image), content_type="image/jpeg")


@login_required
@require_GET
def get_insert_dialog(request):
    form = PhotoInsertForm(auto_id=False)
    place = None
    try:
        place = request.GET["place"]
    except:
        pass
    return render(request, "form/insert/photo.html", {"form": form, "place": place})


@login_required
@require_POST
def update(request, photo_id):
    form = PhotoUpdateForm(request.POST)
    if form.is_valid():
        photo = None
        try:
            photo_id = int(photo_id)
            # TODO we need to update the used_space cookie
            logger.info("User %d is trying to update Photo %d." %
                        (request.user.pk, photo_id))
            photo = Photo.objects.get(pk=photo_id)
            if not is_authorized(photo, request.user):
                logger.warn("User %s not authorized to update Photo %d. Aborting." % (
                    request.user, photo_id))
                return error("not your photo")
        except Photo.DoesNotExist:
            logger.warn("Photo %d does not exist. Aborting." % photo_id)
            return error("photo does not exist")
        form = PhotoUpdateForm(request.POST, instance=photo)
        form.save()
        logger.info("Photo %d updated." % photo_id)
        return success()
    else:
        return error(str(form.errors))


@login_required
@require_POST
def update_multiple(request):
    try:
        json_photos = json.loads(request.POST["photos"])

        if len(json_photos) == 0:
            return error("The array of photo is empty")

        # Collected instances first and update them in one go.
        # This way it is not possible to leave the Db in an inconsistent state.
        photos_dirty = []
        # Check all photos_dirty
        for json_photo in json_photos:
            form = MultiplePhotosUpdateForm(json_photo)
            # fields are incomplete or invalid
            if not form.is_valid():
                return error(str(form.errors))

            # Id cannot be retrieved from form.cleaned_data
            photo_id = int(form.data["id"])
            photo = Photo.objects.get(pk=photo_id)

            # photo does not belong to the user
            if not is_authorized(photo, request.user):
                logger.warn("User %s not authorized to update Photo %d. Aborting." % (
                    request.user, photo_id))
                return error("not your photo")

            photos_dirty.append((photo, json_photo))
    except Exception as e:
        logger.error("Something unexpected happened: %s" % str(e))
        return error(str(e))

    # Update all photos in one go.
    for (photo, json_photo) in photos_dirty:
        logger.info("User %d is trying to update Photo %d." %
                    (request.user.pk, photo.pk))
        form = MultiplePhotosUpdateForm(json_photo, instance=photo)
        assert form.is_valid()  # we checked this before. this must be valid
        form.save()
        logger.info("Photo %d updated." % photo.pk)

    return success()


@login_required
@require_http_methods(["DELETE"])
def delete(request, photo_id):
    try:
        photo_id = int(photo_id)
        logger.info("User %d is trying to delete Photo %d." %
                    (request.user.pk, photo_id))
        photo = Photo.objects.get(pk=photo_id)
        if not is_authorized(photo, request.user):
            logger.warn("User %s not authorized to delete Photo %d. Aborting." % (
                request.user, photo_id))
            return error("not your photo")

        used_space = update_used_space(request.user, -1 * photo.size)
        logger.info("Photo %d deleted." % photo_id)
        photo.delete()
        response = success()
        set_cookie(response, "used_space", used_space)
        return response
    except (KeyError, Photo.DoesNotExist) as e:
        logger.error("Something unexpected happened: %s" % str(e))
        return error(str(e))
