import logging

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.views.decorators.http import require_GET
from pm.models.album import Album
from pm.views import direct_to_template

from .message import jsonify

logger = logging.getLogger(__name__)


@login_required
@require_GET
def view(request):
    return direct_to_template("base-interactive.html")(request)


@login_required
@require_GET
def get(request):
    user = request.user
    logger.info("User %d is trying to get all albums." % user.id)
    albums = Album.objects.all().filter(user=user)
    logger.info("Found %d albums for user %d", len(albums), user.id)

    return HttpResponse(jsonify([album.toserializable(includeplaces=False, isowner=True) for album in albums]), content_type="text/json")
