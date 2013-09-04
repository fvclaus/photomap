'''
Created on Jun 30, 2012

@author: fredo
'''

from django.utils.translation import ugettext as _
from django.http import HttpResponse, HttpResponseBadRequest
import json

def success(**kwargs):
    data = {"success" : True}
    for k in kwargs.keys():
        data[k] = kwargs[k]
        
    return HttpResponse(jsonify(data), content_type = "text/json")

def error(*args, **kwargs):
    data = {"success": False, "error": args[0]}
    for k in kwargs.keys():
        data[k] = kwargs[k]
    
    return HttpResponse(jsonify(data), content_type = "text/json")

def user_inactive_error(**kwargs):
    msg = _("USER_INACTIVE_ERROR")
    return error(msg, **kwargs)

def request_not_allowed_error(**kwargs):
    msg = _("REQUEST_NOT_ALLOWED_ERROR")
    return error(msg, **kwargs)

def jsonify(msg):
    return json.dumps(msg, indent = 4)
