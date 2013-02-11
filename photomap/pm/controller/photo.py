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
from pm.form.photo import PhotoInsertForm, PhotoUpdateForm, PhotoCheckForm
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core import files

from StringIO import StringIO
from PIL import Image

import  logging, sys, uuid


logger = logging.getLogger(__name__)

LONGEST_SIDE = 100

def get_size(original):
    if isinstance(original, files.File):
        return original.size
    else:
        return original.len

def create_thumb(buf):
    image = Image.open(buf)
    size = image.size
    thumb = StringIO()
    
    if size[0] >= size[1]:
        resize_factor = LONGEST_SIDE / float(size[0])
        size = (LONGEST_SIDE, int(resize_factor * size[1]))
    else:
        resize_factor = LONGEST_SIDE / float(size[1])
        size = (int(resize_factor * size[0]), LONGEST_SIDE)
    
    logger.debug("Resizing photo to %s." % str(size))
    resized_image = image.resize(size)
    resized_image.save(thumb, "JPEG", optimize = True)
    thumb.seek(0)
    
    if image.format != "JPEG":
        logger.debug("Photo needs to be converted to JPEG format.")
        original = StringIO()
        image.save(original, "JPEG", optimize = True)
        original.seek(0)
        return original, thumb
    else:
        buf.open()
        return buf, thumb
    

@login_required
def insert(request):
    if request.method == "POST":
        
        form = PhotoCheckForm(request.POST, request.FILES, auto_id = False)
            
        if form.is_valid():
            place = form.cleaned_data["place"]
            logger.info("User %d is trying to insert a new Photo into Place %d." % (request.user.pk, place.pk))
            #===================================================================
            # check place
            #===================================================================
            if not is_authorized(place, request.user):
                logger.warn("User %s not authorized to insert a new Photo in Place %d. Aborting." % (request.user, place.pk))
                return error("This is not your place!")
            #===================================================================
            # check upload limit
            #===================================================================
            size = get_size(request.FILES["photo"])
            userprofile = request.user.userprofile
            if userprofile.used_space + size > userprofile.quota:
                return error("No more space left. Delete or resize some older photos.")
            #===================================================================
            # check & convert image
            #===================================================================
            try:
                original, thumb = create_thumb(request.FILES["photo"])
            except Exception, e:
                return error(str(e))
            #===================================================================
            # insert in correct form and upload if necessary
            #===================================================================
            if settings.DEBUG:
                request.FILES["photo"] = original
                from django.core.files.uploadedfile import InMemoryUploadedFile
                thumb = InMemoryUploadedFile(thumb, "image", "%s_thumbnail.jpeg" % original.name, None, thumb.len, None)
                request.FILES["thumb"] = thumb
                form = PhotoInsertForm(request.POST, request.FILES)
                assert form.is_valid(), "Form should always be valid here."
            else:
                photo_key, thumb_key = handle_upload(request.user, place, original, thumb)
                request.POST["photo"] = photo_key
                request.POST["thumb"] = thumb_key
                form = PhotoInsertForm(request.POST)
                assert form.is_valid(), "Form should always be valid here."
            #===================================================================
            # add order 
            #===================================================================
            photo = form.save(commit = False)
            nphotos = len(Photo.objects.all().filter(place = photo.place))
            photo.order = nphotos
            #===================================================================
            # add size
            #===================================================================
            photo.size = size
            userprofile.used_space += photo.size
            
            userprofile.save()
            photo.save()
            logger.debug("Photo %d inserted with order %d and size %d." % (photo.pk, photo.order, photo.size))
            
            response = success(id = photo.id, photo = photo.getphotourl(), thumb = photo.getthumburl(), url = photo.getphotourl())
            set_cookie(response, "used_space", userprofile.used_space)
            return response
        else:
            return error(str(form.errors))
        
    if request.method == "GET":
        form = PhotoInsertForm(auto_id = False)
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
                id = form.cleaned_data["id"]
                #TODO we need to update the used_space cookie
                logger.info("User %d is trying to update Photo %d." % (request.user.pk, id))
                photo = Photo.objects.get(pk = id)
                if not is_authorized(photo, request.user):
                    logger.warn("User %s not authorized to update Photo %d. Aborting." % (request.user, id))
                    return error("not your photo")
            except Photo.DoesNotExist:
                logger.warn("Photo %d does not exist. Aborting." % id)
                return error("photo does not exist")
            form = PhotoUpdateForm(request.POST, instance = photo)
            form.save()
            logger.info("Photo %d updated." % id)
            return success()
        else:
            return error(str(form.errors))
    else:
        return render_to_response("update-photo.html")

@login_required
def delete(request):
    if request.method == "POST":
        try:
            id = int(request.POST["id"])
            logger.info("User %d is trying to delete Photo %d." % (request.user.pk, id))
            photo = Photo.objects.get(pk = id)
            if not is_authorized(photo, request.user):
                logger.warn("User %s not authorized to delete Photo %d. Aborting." % (request.user, id))
                return error("not your photo")
            userprofile = request.user.userprofile
            logger.debug("Removing space %d used by image from userprofile." % photo.size)
            userprofile.used_space -= photo.size
            userprofile.save()
            logger.info("Photo %d deleted." % id)
            photo.delete()
            response =  success()
            set_cookie(response, "used_space", userprofile.used_space)
            return response
        except (KeyError, Photo.DoesNotExist), e:
            logger.warn("Something unexpected happened: %s" % str(e))
            return error(str(e))
    else:
        return render_to_response("delete-photo.html")


def generate_filenames(user, place):
    """
    @author: Frederik Claus
    @summary: generates a unique filename for production and test settings
        production: [id of user]-[date joined as YYYY-MM-DD]/[id of place]-[unique id].[ext]
        test: test/[unique id].[ext]
        where [unique id] is produced with the uuid the module
    """
    
    userjoined = user.date_joined.strftime("%Y-%m-%d")
    
    if 'test' in sys.argv:
        filename = "test/%s.jpeg" % (uuid.uuid4())
    else:
        filename = "%s-%s/%s-%s.jpeg" % (user.pk, userjoined, place.pk, uuid.uuid4())
        
    thumb = filename.replace(".jpeg", ".0.jpeg")
    
    return filename, thumb

def handle_upload(user, place, original, thumb):
    photo_key, thumb_key = generate_filenames(user, place)
    logger.debug("Upload photo %s and thumbnail %s..." % (photo_key, thumb_key))
    upload_photo(original, photo_key)
    upload_photo(thumb, thumb_key)
    logger.debug("Upload of %s done." % photo_key)
    return photo_key, thumb_key
    
def upload_photo(photo, filename):
    bucket = getbucket()
    key = bucket.new_key(filename)
    key.set_contents_from_file(photo)
    key.set_acl("public-read")
    


        
    
