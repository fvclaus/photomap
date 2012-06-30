'''
Created on Jun 30, 2012

@author: fredo
'''

from django.http import HttpResponse, HttpResponseBadRequest
import json

def success():
    return HttpResponse(jsonify({"success" :  True}), content_type = "text/json")

def error(msg):
    return HttpResponse(jsonify({"success": False, "message" : msg}), content_type = "text/json")

def jsonify(msg):
    return json.dumps(msg, indent = 4)