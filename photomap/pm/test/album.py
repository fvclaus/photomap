# -*- coding: utf8 -*-
'''
Created on 22.07.2012

@author: MrPhil
'''

from simpletestcase import SimpleTestCase
from django.test.client import Client
from data import TEST_PASSWORD, TEST_USER
from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
from data import GPS_MANNHEIM_SCHLOSS

import json
import logging 
import os
from decimal import Decimal

class AlbumControllerTest(SimpleTestCase):
        
    model = Album
    
    def test_delete(self):
        #=======================================================================
        # define url for requests
        #=======================================================================
        self.url = "/delete-album"
        #=======================================================================
        # delete something that exists
        #=======================================================================
        album = Album.objects.get(pk = 1)
        places = [place.pk for place in Place.objects.all().filter(album = album)]
        photos = []
        
        for place in places:
            photos.extend([(photo.pk,photo.photo.path) for photo in Photo.objects.all().filter(place = place)])
            
        self.assertDeletes({"id" : 1})
        
        for place in places:
            self.assertDoesNotExist(place, model = Place)
        
        for photo in photos:
            self.assertPhotoDeleted(photo)
        
        #=======================================================================
        # delete something that does not exist
        #=======================================================================
        self.assertError({"id":9999})
        #=======================================================================
        # use wrong paramater
        #=======================================================================
        self.assertError({"wrong" : "abc"})
        
        
        
    def test_insert(self):
        self.url = "/insert-album"
        #=======================================================================
        # insert something valid without description
        #=======================================================================
        data = {"title": "Mannheim",
                "lat": GPS_MANNHEIM_SCHLOSS["lat"],
                "lon": GPS_MANNHEIM_SCHLOSS["lon"]}
        (album, content) = self.assertCreates(data)
        self.assertEqual(album.title, data["title"])
        self.assertEqual(album.country,"de")
        #=======================================================================
        # insert something valid with description
        #=======================================================================
        data["description"] = "Some text,text,... Testing some umlauts üäß and other special characters <javascript></javascript>"
        (album,content) = self.assertCreates(data)
        self.assertEqual(album.description,data["description"])
        #=======================================================================
        # insert somthing that is not valid
        #=======================================================================
        del data["lat"]
        self.assertError(data)
        #=======================================================================
        # delete some more
        #=======================================================================
        del data["lon"]
        self.assertError(data)
        
    def test_update(self):
        self.url = "/update-album"
        #=======================================================================
        # test something valid without description
        #=======================================================================
        data = {"id" : 1,
                "title" : "EO changed"}
        (album, content) = self.assertUpdates(data)
        self.assertEqual(album.title, data["title"])
        #=======================================================================
        # with description
        #=======================================================================
        data["description"] = "The description changed"
        (album, content) = self.assertUpdates(data)
        self.assertEqual(album.description, data["description"])
        #=======================================================================
        # wrong id test
        #=======================================================================
        data["id"] = 999 # does not exist
        self.assertError(data)
        
   