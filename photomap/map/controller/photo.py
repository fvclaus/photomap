'''
Created on Jun 30, 2012

@author: fredo
'''

from django.http import HttpResponse, HttpResponseBadRequest
from map.model.photo import Photo

from message import success, error 
from django.utils.datastructures import MultiValueDictKeyError

import logging

logger = logging.getLogger(__name__)

# TODO: maybe this can be abstracted by using middleware that checks for the existence of an error string and renders the error message
def delete(request):
    if request.method == "POST":
        logger.debug("inside delete post")
        try:
            id = request.POST["id"]
            Photo.objects.get(pk = id).delete()
            return success()
        except (KeyError, Photo.DoesNotExist), e:
            return error(str(e))
    else:
        logger.debug("form not available yet")
        return HttpResponseBadRequest()
    
def insert(request):
    if request.method == "POST":
        pass
        
    
