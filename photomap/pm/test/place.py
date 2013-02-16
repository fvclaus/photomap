'''
Created on Jul 8, 2012

@author: fredo
'''

from apitestcase import ApiTestCase
from django.test.client import Client
from decimal import Decimal
import json
from pm.model.place import Place
from pm.model.photo import Photo
import os
from data import GPS_MANNHEIM_SCHLOSS
from copy import deepcopy

class PlaceControllerTest(ApiTestCase):
    
    model = Place
    
    def test_insert(self):
        #=======================================================================
        # define url for post requests
        #=======================================================================
        self.url = "/insert-place"
        #=======================================================================
        # without description
        #=======================================================================

        data = {"album" : 1,
                "lat": GPS_MANNHEIM_SCHLOSS["lat"],
                "lon": GPS_MANNHEIM_SCHLOSS["lon"],
                "title": "Next to EO", }
        (place, content) = self.assertCreates(data)
        self.assertEqual(place.title, data["title"])
        #=======================================================================
        # with description 
        #=======================================================================
        data["description"] = "Some description, blah, blah..."
        (place, content) = self.assertCreates(data)
        self.assertEqual(place.description, data["description"])
        #=======================================================================
        # into somebody elses album
        #=======================================================================
        data["album"] = 2
        self.assertError(data)
        data["album"] = 1
        #=======================================================================
        # something invalid
        #=======================================================================
        data2 = deepcopy(data)
        del data2["lat"]
        self.assertError(data2)
        #=======================================================================
        # something else invalid
        #=======================================================================
        data3 = deepcopy(data)
        del data3["lon"]
        self.assertError(data3)
    
        
    def test_update(self):
        self.url = "/update-place"
        #=======================================================================
        # without description
        #=======================================================================
        data = {"id": 1,
                "title": "Some other title"}
        (place, content) = self.assertUpdates(data)
        self.assertEqual(place.title, data["title"])
        #=======================================================================
        # with description
        #=======================================================================
        data["description"] = "Some other description"
        (place, content) = self.assertUpdates(data)
        self.assertEqual(place.description, data["description"])
        #=======================================================================
        # something that doesnt belong to you
        #=======================================================================
        data["id"] = 2
        self.assertError(data)
        #=======================================================================
        # something invalid
        #=======================================================================
        data["id"] = 9999
        self.assertError(data)
        
    
    def test_delete(self):
        self.url = "/delete-place"
        #=======================================================================
        # valid request
        #=======================================================================
        place = Place.objects.get(pk = 1)
        photos = Photo.objects.all().filter(place = place)
        self.assertDeletes({"id": place.pk})
#        assert on delete cascade
        for photo in photos:
            self.assertPhotoDeleted(photo)
        self.assertEqual(self.user.userprofile.used_space, 164898)
        #=======================================================================
        # not yours
        #=======================================================================
        self.assertError({"id":1})
        #=======================================================================
        # not valid
        #=======================================================================
        self.assertError({"id": 9999})
