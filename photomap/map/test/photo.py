# -*- coding: utf8 -*-
'''
Created on Jun 29, 2012
@author: fredo
'''

from simpletestcase import SimpleTestCase
from django.test.client import Client
from config import TEST_PASSWORD, TEST_USER
from map.model.photo import Photo
import config
import json
import logging 
import os

class PhotoControllerTest(SimpleTestCase):
        
    model = Photo
    
    def test_delete(self):
        #=======================================================================
        # define url for requests
        #=======================================================================
        self.url = "/delete-photo"
        #=======================================================================
        # delete something that exists
        #=======================================================================
        path = Photo.objects.get(pk = 2).photo.path
        self.assertDeletes({"id" : 2})
        self.assertFalse(os.path.exists(path))
        #=======================================================================
        # delete something that does not exist
        #=======================================================================
        self.assertError({"id":9999})
        #=======================================================================
        # use wrong paramater
        #=======================================================================
        self.assertError({"wrong" : "abc"})
        
        
        
    def test_insert(self):
        self.url = "/insert-photo"
        #=======================================================================
        # insert something valid without description
        #=======================================================================
        photo = open(config.TEST_PHOTO, "rb")
        data = {"place": 1,
                "title": "Chuck Norris",
                "photo" : photo}
        (photo, content) = self.assertCreates(data)
        self.assertEqual(photo.title, data["title"])
        #=======================================================================
        # insert something valid with description
        #=======================================================================
        photo = open(config.TEST_PHOTO, "rb")
        data["photo"] = photo
        data["description"] = "Some text,text,... Testing some umlauts äüö and other special characters <javascript></javascript>"
        self.assertCreates(data)
        #=======================================================================
        # insert somthing that is not valid
        #=======================================================================
        del data["photo"]
        self.assertError(data)
        #=======================================================================
        # delete some more
        #=======================================================================
        del data["title"]
        self.assertError(data)
        
    def test_update(self):
        self.url = "/update-photo"
        #=======================================================================
        # test something valid without description
        #=======================================================================
        data = {"id" : 2,
                "title" : "EO changed"}
        (photo, content) = self.assertUpdates(data)
        self.assertEqual(photo.title, data["title"])
        #=======================================================================
        # with description
        #=======================================================================
        data["description"] = "The description changed"
        (photo, content) = self.assertUpdates(data)
        self.assertEqual(photo.description, data["description"])
        #=======================================================================
        # with order
        #=======================================================================
        data["order"] = 3
        (photo, content) = self.assertUpdates(data)
        self.assertEqual(photo.order, data["order"])
        #=======================================================================
        # wrong id test
        #=======================================================================
        data["id"] = 999 # does not exist
        self.assertError(data)
        
