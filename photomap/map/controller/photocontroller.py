'''
Created on Jun 30, 2012

@author: fredo
'''

from django.http import HttpResponse
from map.model.photo import Photo

from message import success, error 
from django.utils.datastructures import MultiValueDictKeyError


# TODO: maybe this can be abstracted by using middleware that checks for the existence of an error string and renders the error message
def insert(request):
    try:
        id = request.POST["id"]
        Photo.objects.get(pk = id).delete()
        return success()
    except (KeyError, Photo.DoesNotExist), e:
        return error(str(e))
    
