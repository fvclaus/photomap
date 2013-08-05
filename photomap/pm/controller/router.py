'''
Created on Jul 25, 2013

@author: Marc
'''

from django.http import Http404, HttpResponseNotAllowed
from django.conf.urls.defaults import url

GET = 'GET'
PUT = 'PUT'
POST = 'POST'
HEAD = 'HEAD'
TRACE = 'TRACE'
DELETE = 'DELETE'
OPTIONS = 'OPTIONS'

HTTP_METHODS = (GET, POST, PUT, HEAD, DELETE, OPTIONS, TRACE)

def dispatch(request, *args, **kwargs):
    handler = kwargs.pop(request.method, None)
    if handler:
        for method in HTTP_METHODS:
            kwargs.pop(method, None)
        return handler(request, *args, **kwargs)
    else:
        allowed_methods = []
        for method in HTTP_METHODS:
            if kwargs.pop(method, None):
                allowed_methods.append(method)
        if allowed_methods:
            return HttpResponseNotAllowed(allowed_methods)
        else:
            raise Http404

def method_mapper(regex, controller_name, get = None, post = None, put = None, delete = None, head = None, options = None, trace = None):
    handlers = { GET: get, POST: post, PUT: put, DELETE: delete, HEAD: head, OPTIONS: options, TRACE: trace }
    return url(regex, dispatch, handlers, controller_name)
