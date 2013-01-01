'''
Created on Jun 30, 2012

@author: fredo
'''

from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render_to_response

from pm.model.photo import Photo
from pm.util.s3 import getbucket
from pm.controller.authentication import is_authorized
from pm.controller import set_cookie

from message import success, error 
from pm.form.photo import PhotoInsertPRODForm,PhotoInsertDEBUGForm, PhotoUpdateForm, PhotoCheckPRODForm
from django.contrib.auth.decorators import login_required
from django.conf import settings


import  logging, sys, uuid

logger = logging.getLogger(__name__)

@login_required
def insert(request):
    if request.method == "POST":
        
        if settings.DEBUG:
            form = PhotoInsertDEBUGForm(request.POST, request.FILES, auto_id = False)
        else:
            form = PhotoCheckPRODForm(request.POST,request.FILES, auto_id = False)
            
        if form.is_valid():
            place = form.cleaned_data["place"]
            
            if not is_authorized(place,request.user):
#                form.errors["place"] = "This is not your place!"
#                return render_to_response("insert-photo-error.html",{form:form})
                return error("This is not your place!")
            
            size = request.FILES["photo"].size
            
            if settings.DEBUG:
                pass
            else:
                key = _handle_file(request,form)
                request.POST["photo"] = key
                form = PhotoInsertPRODForm(request.POST)
                form.is_valid()
                
            # add photo at the very end                
            photo = form.save(commit = False)
            nphotos = len(Photo.objects.all().filter(place = photo.place))
            photo.order = nphotos
            # add the size of the photo
            photo.size = size
            # update the used space
            userprofile = request.user.userprofile
            userprofile.used_space += size
            userprofile.save()
            # store photo record
            photo.save()

            response =  success(id = photo.id, url = photo.getphotourl())
            set_cookie(response, "used_space", userprofile.used_space)
            return response
        else:
            # closes iframe and displays error message
#            return render_to_response("insert-photo-error.html", {form : form})
            return error(str(form.errors))
        
    if request.method == "GET":
        form = PhotoInsertDEBUGForm(auto_id = False)
        place = None
        try:
            place = request.GET["place"]
        except:
            pass
        return render_to_response("insert-photo.html", {"form":form, "place":place})

@login_required
def update(request):
    if request.method == "POST":
        form = PhotoUpdateForm(request.POST)
        if form.is_valid():
            photo = None
            try:
                photo = Photo.objects.get(pk = form.cleaned_data["id"])
                if not is_authorized(photo,request.user):
                    return error("not your photo")
            except Photo.DoesNotExist:
                return error("photo does not exist")
            form = PhotoUpdateForm(request.POST, instance = photo)
            form.save()
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-photo.html")

@login_required
def delete(request):
    if request.method == "POST":
        logger.debug("inside delete post")
        try:
            id = request.POST["id"]
            photo = Photo.objects.get(pk = id)
            if not is_authorized(photo, request.user):
                return error("not your photo")
            # update used space
            userprofile = request.user.userprofile
            userprofile.used_space -= photo.size
            userprofile.save()
            # remove photo record
            photo.delete()
            return success()
        except (KeyError, Photo.DoesNotExist), e:
            return error(str(e))
    else:
        return HttpResponseBadRequest()


def _generate_filename(request,form,filename):
    """
    @author: Frederik Claus
    @summary: generates a unique filename for production and test settings
        production: [id of user]-[date joined as YYYY-MM-DD]/[id of place]-[unique id].[ext]
        test: test/[unique id].[ext]
        where [unique id] is produced with the uuid the module
    """
    userid = request.user.pk
    userjoined = request.user.date_joined.strftime("%Y-%m-%d")
    placeid = form.cleaned_data["place"].pk
    ext = filename.split('.')[-1]
    if 'test' in sys.argv:
        filename = "test/%s.%s" % (uuid.uuid4(), ext)
    else:
        filename = "%s-%s/%s-%s.%s" % (userid,userjoined,placeid,uuid.uuid4(), ext)
    return filename

def _handle_file(request,form):
    file = request.FILES["photo"]
    filename = _generate_filename(request,form,file.name)
    _uploadphoto(file, filename)
    return filename
    
def _uploadphoto(file,filename):
    bucket = getbucket()
    key = bucket.new_key(filename)
    key.set_contents_from_file(file)
    key.set_acl("public-read")
    


        
    
