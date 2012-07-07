'''
Created on Jun 30, 2012

@author: fredo
'''

from django.http import HttpResponse, HttpResponseBadRequest
import json

def success(**kwargs):
    data = {
            "success" : True}
    for k in kwargs.keys():
        data[k] = kwargs[k]
        
    return HttpResponse(jsonify(data), content_type = "text/json")

def error(msg):
    return HttpResponse(jsonify({"success": False, "error" : msg}), content_type = "text/json")

def jsonify(msg):
    return json.dumps(msg, indent = 4)
