'''
Created on Jul 8, 2012

@author: fredo
'''

from simpletestcase import SimpleTestCase
from django.test.client import Client
from decimal import Decimal
import json
from pm.model.place import Place
from pm.model.photo import Photo
import os
from data import GPS_MANNHEIM_SCHLOSS

class PlaceControllerTest(SimpleTestCase):
    
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
        # something invalid
        #=======================================================================
        del data["lat"]
        self.assertError(data)
        #=======================================================================
        # something else invalid
        #=======================================================================
        del data["lon"]
        self.assertError(data)
    
        
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
        #=======================================================================
        # not valid
        #=======================================================================
        self.assertError({"id": 9999})
