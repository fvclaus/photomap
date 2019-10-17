import decimal
import json

from django.http import HttpResponse, HttpResponseBadRequest
from django.utils.translation import ugettext as _


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(JSONEncoder, self).default(o)


class EmptyResponse:
    def toserializable(self):
        return {}


# TODO Use status codes
def success(response=EmptyResponse(), **kwargs):
    data = {"success": True}
    if hasattr(response, 'toserializable'):
        serialiable_response = response.toserializable(**kwargs)
    else:
        serialiable_response = response
    for k in serialiable_response.keys():
        data[k] = serialiable_response[k]

    return HttpResponse(jsonify(data), content_type="text/json")


def error(*args, **kwargs):
    data = {"success": False, "error": args[0]}
    for k in kwargs.keys():
        data[k] = kwargs[k]

    return HttpResponse(jsonify(data), content_type="text/json")


def user_inactive_error(**kwargs):
    msg = _("USER_INACTIVE_ERROR")
    return error(msg, **kwargs)


def request_not_allowed_error(**kwargs):
    msg = _("REQUEST_NOT_ALLOWED_ERROR")
    return error(msg, **kwargs)


def jsonify(msg):
    return json.dumps(msg, indent=4, cls=JSONEncoder)
