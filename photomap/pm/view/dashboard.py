import decimal
import json
import logging

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.views.decorators.http import require_GET

from pm.models.album import Album

logger = logging.getLogger(__name__)


@login_required
@require_GET
def view(request):
    return render_to_response("dashboard.html")


@login_required
@require_GET
def get(request):
    user = request.user
    logger.info("User %d is trying to get all albums." % user.id)
    albums = Album.objects.all().filter(user=user)
    logger.info("Found %d albums for user %d", len(albums), user.id)
    data = []

    for album in albums:
        albumflat = album.toserializable(includeplaces=False)
        albumflat["isOwner"] = True
        data.append(albumflat)

    return HttpResponse(json.dumps(data, cls=DecimalEncoder), content_type="text/json")


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)
