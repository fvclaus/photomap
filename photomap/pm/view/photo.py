'''
Created on Jun 30, 2012

@author: Frederik Claus
'''

from django.shortcuts import render_to_response

from pm.model.photo import Photo
from pm.util.s3 import getbucket
from pm.view.authentication import is_authorized
from pm.view import set_cookie, update_used_space

from message import success, error 
from pm.form.photo import PhotoInsertForm, PhotoUpdateForm, PhotoCheckForm, MultiplePhotosUpdateForm
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core import files
from django.views.decorators.http import require_http_methods, require_GET, require_POST

from StringIO import StringIO
from PIL import Image, ImageFile
import json 
import  logging, sys, uuid

ImageFile.MAXBLOCK = 2 ** 20

logger = logging.getLogger(__name__)

LONGEST_SIDE_THUMB = 100
LONGEST_SIDE = 1200


def get_size(original):
    if isinstance(original, files.File):
        return original.size
    else:
        return original.len
    
def calculate_size(longest_side, other_side, limit):
    resize_factor = limit / float(longest_side)
    return (limit, int(resize_factor * other_side))

def resize(size, limit):
    if size[0] >= size[1]:
        size = calculate_size(size[0], size[1], limit)
    else:
        size = calculate_size(size[1], size[0], limit)
    return size

def create_thumb(buf):
    image = Image.open(buf)
    size = image.size
    thumb = StringIO()
    
    thumb_size = resize(size, LONGEST_SIDE_THUMB)
        
    logger.debug("Resizing photo to %s." % str(thumb_size))
    resized_image = image.resize(thumb_size)
    resized_image.save(thumb, "JPEG", optimize = True)
    thumb.seek(0)
    
    if size[0] > LONGEST_SIDE or size[1] > LONGEST_SIDE:
        original_size = resize(size, LONGEST_SIDE)
        logger.debug("Resizing photo to %s." % str(original_size))
        original = StringIO()
<<<<<<< HEAD
=======
#        buf.open()
#        image = Image.open(buf)
>>>>>>> parent of a4e88d0... Migration from PIL to pymaging
        resized_image = image.resize(original_size)
        resized_image.save(original, "JPEG", quality = 80, optimize = True, progressive = True)
        original.seek(0)
        return original, thumb
    else:
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
@require_POST
def insert(request):
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
        # check & convert image
        #===================================================================
        name = request.FILES["photo"].name
        try:
            original, thumb = create_thumb(request.FILES["photo"])
        except Exception, e:
            return error(str(e))
        #===================================================================
        # check upload limit
        #===================================================================
        size = get_size(original)
        userprofile = request.user.userprofile
        if userprofile.used_space + size > userprofile.quota:
            return error("No more space left. Delete or resize some older photos.")
        #===================================================================
        # insert in correct form and upload if necessary
        #===================================================================
        if settings.DEBUG:
            from django.core.files.uploadedfile import InMemoryUploadedFile
            
            if (not isinstance(original, files.File)):
                original = InMemoryUploadedFile(original, "image", "%s.jpg" % name, None, original.len, None)
            
            request.FILES["photo"] = original
            thumb = InMemoryUploadedFile(thumb, "image", "%s_thumbnail.jpg" % name, None, thumb.len, None)
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
#        nphotos = len(Photo.objects.all().filter(place = photo.place))
        photo.order = 0
        #===================================================================
        # add size
        #===================================================================
        photo.size = size
        userprofile.used_space += photo.size
        
        userprofile.save()
        photo.save()
        logger.debug("Photo %d inserted with order %d and size %d." % (photo.pk, photo.order, photo.size))
        
        response = success(id = photo.id, photo = photo.getphotourl(), thumb = photo.getthumburl(), url = photo.getphotourl(), order = photo.order)
        set_cookie(response, "used_space", userprofile.used_space)
        return response
    else:
        return error(str(form.errors))
       
@login_required
@require_GET 
def get_insert_dialog(request):
    form = PhotoInsertForm(auto_id = False)
    place = None
    try:
        place = request.GET["place"]
    except:
        pass
    return render_to_response("form/insert/photo.html", {"form":form, "place":place})

@login_required
@require_POST
def update(request, photo_id):
    form = PhotoUpdateForm(request.POST)
    if form.is_valid():
        photo = None
        try:
            photo_id = int(photo_id)
            # TODO we need to update the used_space cookie
            logger.info("User %d is trying to update Photo %d." % (request.user.pk, photo_id))
            photo = Photo.objects.get(pk = photo_id)
            if not is_authorized(photo, request.user):
                logger.warn("User %s not authorized to update Photo %d. Aborting." % (request.user, photo_id))
                return error("not your photo")
        except Photo.DoesNotExist:
            logger.warn("Photo %d does not exist. Aborting." % photo_id)
            return error("photo does not exist")
        form = PhotoUpdateForm(request.POST, instance = photo)
        form.save()
        logger.info("Photo %d updated." % photo_id)
        return success()
    else:
        return error(str(form.errors))


@login_required
@require_POST
def update_multiple(request):
    try:
        json_photos = json.loads(request.POST["photos"])
    
        if len(json_photos) == 0:
            return error("The array of photo is empty")

        # Collected instances first and update them in one go.
        # This way it is not possible to leave the Db in an inconsistent state.
        photos_dirty = []
        # Check all photos_dirty
        for json_photo in json_photos:
            form = MultiplePhotosUpdateForm(json_photo)
            # fields are incomplete or invalid
            if not form.is_valid():
                return error(str(form.errors))
            
            # Id cannot be retrieved from form.cleaned_data
            photo_id = int(form.data["id"])
            photo = Photo.objects.get(pk = photo_id)
        
            # photo does not belong to the user
            if not is_authorized(photo, request.user):
                logger.warn("User %s not authorized to update Photo %d. Aborting." % (request.user, photo_id))
                return error("not your photo")
            
            photos_dirty.append((photo, json_photo))
    except Exception, e:
        logger.warn("Something unexpected happened: %s" % str(e))
        return error(str(e))
        
    
    # Update all photos in one go.
    for (photo, json_photo) in photos_dirty:
        logger.info("User %d is trying to update Photo %d." % (request.user.pk, photo.pk))
        form = MultiplePhotosUpdateForm(json_photo, instance = photo)
        assert form.is_valid()  # we checked this before. this must be valid
        form.save()
        logger.info("Photo %d updated." % photo.pk)
    
    return success()


@login_required
@require_http_methods(["DELETE"])
def delete(request, photo_id):
    try:
        photo_id = int(photo_id)
        logger.info("User %d is trying to delete Photo %d." % (request.user.pk, photo_id))
        photo = Photo.objects.get(pk = photo_id)
        if not is_authorized(photo, request.user):
            logger.warn("User %s not authorized to delete Photo %d. Aborting." % (request.user, photo_id))
            return error("not your photo")
        
        used_space = update_used_space(request.user, -1 * photo.size)
        logger.info("Photo %d deleted." % photo_id)
        photo.delete()
        response = success()
        set_cookie(response, "used_space", used_space)
        return response
    except (KeyError, Photo.DoesNotExist), e:
        logger.warn("Something unexpected happened: %s" % str(e))
        return error(str(e))


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
        filename = "test/%s.jpg" % (uuid.uuid4())
    else:
        filename = "%s-%s/%s-%s.jpg" % (user.pk, userjoined, place.pk, uuid.uuid4())
        
    thumb = filename.replace(".jpg", ".0.jpg")
    
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
    key.set_contents_from_file(photo, headers = {"Content-Type" : "image/jpeg"}, policy = "public-read")
#    key.set_acl("public-read")
    


        
    
