'''
Created on Jul 16, 2012

@author: fredo
'''

import sqlite3
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
from django.contrib.auth.models import User
from django.test.client import Client 
from django.core.files import File
from django.db.utils import DatabaseError
import decimal
import os
import json
import HTMLParser
_htmlparser = HTMLParser.HTMLParser()

DEMO_PASSWORD  = "aeGoh7"

client = Client(HTTP_USER_AGENT = "firefox/15")
client.login(username = "demo", password = "aeGoh7")

def unescape(data):
    if not data:
        return data
    else:
        return _htmlparser.unescape(data)


def convert(path, data):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    base = os.path.split(path)[0]
    c = conn.cursor()
    albums = c.execute("select * from albums")
    
    for albumdb in albums:
        album = Album(lat = data["album-lat"],
                      lon = data["album-lon"],
                      title = unescape(albumdb['name']),
                      description = unescape(albumdb['desc']),
                      user = data["user"])
        album.save()
        print "Saved album %s" % str(album)
        
        places = c.execute("select * from places where album = ?", (albumdb['id'],)).fetchall()
        
        for placedb in places:
            place = Place(lat = decimal.Decimal(placedb['lat']),
                          lon = decimal.Decimal(placedb['lng']),
                          title = unescape(placedb['name']),
                          description = unescape(placedb['desc']),
                          album = album)
            place.save()
            print "Saved place %s." % str(place)
            
            photos = c.execute("select * from photos where place = ?", (placedb['id'],)).fetchall()
            counter = 0
            
            for photodb in photos:
                photopath = os.path.join(base, "public", photodb['source'])
                source = open(photopath, "rb")
                size = os.stat(photopath).st_size
                order = photodb['order'] or counter 
#                thumb = open(photopath, "rb")
                data = {"title": unescape(photodb['name']),
                        "description": unescape(photodb['desc']),
                        "photo": File(source),
                        "order": order,
                        "place": place.pk}
                
                response = client.post("/insert-photo", data = data)
                content = json.loads(response.content)
                if content["success"]:
                    print "Saved photo %s." % str(unescape(photodb["name"]))
                else:
                    raise RuntimeError, "Expected success, got error %s instead." % str(content["error"])
                
                
            

if __name__ == "__main__":
    data = {"album-lat": decimal.Decimal(35.012414),
            "album-lon": decimal.Decimal(135.768356),
            "user": User.objects.get(username = "demo")}
    convert("/home/fredo/javascript/multi-level-photo/map.sqlite", data)
