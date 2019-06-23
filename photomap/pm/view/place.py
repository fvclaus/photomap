import logging

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST

from pm.form.place import InsertPlaceForm, UpdatePlaceForm
from pm.models.photo import Photo
from pm.models.place import Place
from pm.view import set_cookie, update_used_space
from pm.view.authentication import is_authorized

from .message import error, success

logger = logging.getLogger(__name__)


@login_required
@require_POST
def insert(request):
    form = InsertPlaceForm(request.POST)
    if form.is_valid():
        logger.info("User %d is trying to insert a new Place." %
                    request.user.pk)
        if not form.cleaned_data["album"].user == request.user:
            logger.warn("User %d not authorized to insert a new Place in Album %d. Aborting." % (
                request.user.pk, form.cleaned_data["album"].pk))
            # TODO Add localization.
            return error("not your album")
        place = form.save()
        logger.info("Place %d inserted." % place.pk)
        return success(place)
    else:
        return error(str(form.errors))


@login_required
@require_POST
def update(request, place_id):
    form = UpdatePlaceForm(request.POST)
    if form.is_valid():
        place = None
        try:
            place_id = int(place_id)
            logger.debug("User %d is trying to update Place %d." %
                         (request.user.pk, place_id))
            place = Place.objects.get(pk=place_id)
        except Place.DoesNotExist:
            logger.warn("Place %d does not exist.", place_id)
            # TODO Add localization.
            return error("place does not exist")
        # Place does not store reference to user.
        if not is_authorized(place, request.user):
            logger.warn("User %d not authorized to update Place %d. Aborting." % (
                request.user.pk, place_id))
            # TODO Add localization.
            return error("not your place")
        # Create a new place.
        form = UpdatePlaceForm(request.POST, instance=place)
        form.save()
        logger.info("Place %d updated." % place_id)
        return success()
    else:
        return error(str(form.errors))


@login_required
@require_http_methods(["DELETE"])
def delete(request, place_id):
    try:
        place_id = int(place_id)
        logger.info("User %d is trying to delete Place %d." %
                    (request.user.pk, place_id))
        place = Place.objects.get(pk=place_id)
        if not is_authorized(place, request.user):
            logger.warn("User %d not authorized to delete Place %d. Aborting." % (
                request.user.pk, place_id))
            # TODO Add localization.
            return error("not your place")
        size = 0
        for photo in Photo.objects.filter(place=place):
            size += photo.size
        used_space = update_used_space(request.user, -1 * size)
        place.delete()
        logger.info("Place %d deleted." % place_id)
        response = success()
        set_cookie(response, "used_space", used_space)
        return response
    except (OSError, Place.DoesNotExist) as e:
        return error(str(e))
