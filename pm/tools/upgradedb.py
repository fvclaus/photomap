'''
Created on Jan 10, 2013

@author: fredo
'''

import sqlite3
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
from pm.util import s3
from pm.models.user import User
from django.conf import settings
from django.test.client import Client 
from django.core.files import File
from django.db.utils import DatabaseError
import decimal
import urllib2, urlparse
import os
import json
import HTMLParser
from PIL import Image
from PIL import ImageFile
ImageFile.MAXBLOCK = 1000000

_htmlparser = HTMLParser.HTMLParser()

DEMO_PASSWORD = "aeGoh7"
EXPORT_FOLDER = os.path.join(settings.RES_PATH, "export")
MIN_SIZE = 1200

client = Client(HTTP_USER_AGENT = "Firefox/15")

from django.conf import settings
# assert settings.DEBUG is False, "Make sure settings_prod is used."


def unescape(data):
    if not data:
        return data
    else:
        return _htmlparser.unescape(data)

def download_photo(url, id):
    new = os.path.join(EXPORT_FOLDER, "%s.jpeg" % id)
    original = new.replace(".jpeg", ".original.jpeg")
    
    if os.path.exists(new):
        print "%s is already downloaded. Skipping..." % url
        return open(new, "rb")
    
    url = s3.build_url(url)
    print "Downloading photo %s..." % url
    try:
        response = urllib2.urlopen(url)
    except Exception, e:
        print "Could not fetch %s: %s" % (url, str(e))
        return False
     
    print "Done."
    photo = open(original, "wb")
    photo.write(response.read())
    photo.close()
    
    photo = Image.open(original)
    print "Original size %dx%d." % photo.size
    
    if (photo.size[0] > MIN_SIZE and photo.size[1] > MIN_SIZE):
        if photo.size[0] >= photo.size[1]:
            resize_factor = photo.size[0] / MIN_SIZE
            size = (MIN_SIZE, int(photo.size[1] / float(resize_factor)))
            print "Resizing to %d,%d" % size
            photo = photo.resize(size)
        else:
            resize_factor = photo.size[1] / MIN_SIZE
            size = (int(photo.size[0] / float(resize_factor)), MIN_SIZE)
            print "Resizing to %d,%d" % size
            photo = photo.resize(size)
    else:
        print "No resizing necessary."
    
    photo.save(new, "JPEG")
#    os.remove(original)
    
    return open(new, "rb")
    


def convert(path, data, save = True):
    assert os.path.isfile(path)
    user = data["user"]
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    base = os.path.split(path)[0]
    c = conn.cursor()
    albums = c.execute("select * from pm_album where user_id = ?", (data["id"],)).fetchall()
    
    for albumdb in albums:
        
        album_data = {"lat" : decimal.Decimal(albumdb["lat"]),
                "lon" : decimal.Decimal(albumdb["lon"]),
                "title" : unescape(albumdb['title']),
                "description" : unescape(albumdb['description'])}
                    
        if save :         
            response = client.post("/insert-album", data = album_data)
            content = json.loads(response.content)
            if content["success"]:
                print "Saved album %s." % str(unescape(album_data["title"]))
                album = Album.objects.latest("pk")
            else:
                raise RuntimeError, "Expected success, got error %s instead." % str(content["error"])
            
        
        places = c.execute("select * from pm_place where album_id = ?", (albumdb['id'],)).fetchall()
        
        for placedb in places:

            if save:
                place = Place(lat = decimal.Decimal(placedb['lat']),
                              lon = decimal.Decimal(placedb['lon']),
                              title = unescape(placedb['title']),
                              description = unescape(placedb['description']),
                              album = album)
                place.save()
                print "Saved place %s." % str(place)

            
            photos = c.execute("select * from pm_photo where place_id = ?", (placedb['id'],)).fetchall()
            counter = 0
            
            for photodb in photos:
                source = download_photo(photodb["photo"], photodb["id"])
                if not source:
                    continue
                order = photodb['order'] or counter 
                
                if save:
                    data = {"title": unescape(photodb['title']),
                        "description": unescape(photodb['description']),
                        "photo": File(source),
                        "order": order,
                        "place": place.pk}
                    response = client.post("/insert-photo", data = data)
                    content = json.loads(response.content)
                    if content["success"]:
                        print "Saved photo %s." % str(unescape(photodb["title"]))
                    else:
                        raise RuntimeError, "Expected success, got error %s instead." % str(content["error"])
                
                
            

if __name__ == "__main__":
    assert client.login(username = "demo@keiken.de", password = "aeGoh7"), "Login data seems to be wrong!"
    user = User.objects.get(username = "demo@keiken.de")
    data = {"user": user, "id" : user.pk}
    convert(os.path.join(settings.PROJECT_PATH, "export.sqlite3"), data, save = False)
