'''
Created on Jan 10, 2013

@author: fredo
'''

import sqlite3
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
from pm.util import s3
from django.contrib.auth.models import User
from django.conf import settings
from django.test.client import Client 
from django.core.files import File
from django.db.utils import DatabaseError
import decimal
import urllib2, urlparse
import os
import json
import HTMLParser
_htmlparser = HTMLParser.HTMLParser()

DEMO_PASSWORD = "aeGoh7"
EXPORT_FOLDER = os.path.join(settings.RES_PATH, "export")

client = Client(HTTP_USER_AGENT = "Firefox/15")
assert client.login(username = "anna.lena.hoenig@gmail.com", password = "Yaish8"), "Login data seems to be wrong!"

def unescape(data):
    if not data:
        return data
    else:
        return _htmlparser.unescape(data)

def download_photo(url, id):
    filename = os.path.join(EXPORT_FOLDER, "%s.jpeg" % id)
    if os.path.exists(filename):
        print "%s is already downloaded. Skipping..." % url
        return open(filename, "rb")
    
    url = s3.build_url(url)
    print "Downloading photo %s..." % url
    response = urllib2.urlopen(url)
    print "Done."
    photo = open(filename, "wb")
    photo.write(response.read())
    photo.close()
    
    return open(filename, "rb")
    


def convert(path, data):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    base = os.path.split(path)[0]
    c = conn.cursor()
    albums = c.execute("select * from pm_album")
    
    for albumdb in albums:
        album = Album(lat = decimal.Decimal(albumdb["lat"]),
                      lon = decimal.Decimal(albumdb["lon"]),
                      title = unescape(albumdb['title']),
                      description = unescape(albumdb['description']),
                      user = data["user"])
        album.save()
        print "Saved album %s" % str(album)
        
        places = c.execute("select * from pm_place where album_id = ?", (albumdb['id'],)).fetchall()
        
        for placedb in places:
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
                order = photodb['order'] or counter 
#                thumb = open(photopath, "rb")
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
    data = {"user": User.objects.get(email = "anna.lena.hoenig@gmail.com")}
    convert(os.path.join(settings.PROJECT_PATH, "export.sqlite"), data)
