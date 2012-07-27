# -*- coding: utf8 -*-
'''
Created on Jun 29, 2012
@author: fredo
'''

from simpletestcase import SimpleTestCase
from django.test.client import Client
from data import TEST_PASSWORD, TEST_USER,TEST_PHOTO
from pm.model.photo import Photo

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
        photo = Photo.objects.get(pk = 1)
        photo = (photo.pk,photo.photo.path)
        self.assertDeletes({"id" : 1})
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
        self.url = "/insert-photo"
        #=======================================================================
        # insert something valid without description
        #=======================================================================
        photo = open(TEST_PHOTO, "rb")
        data = {"place": 1,
                "title": "Chuck Norris",
                "photo" : photo}
        (photo, content) = self.assertCreates(data, check = self.assertPhotoCreateSuccess)
        self.assertEqual(photo.title, data["title"])
        #=======================================================================
        # insert something valid with description
        #=======================================================================
        photo = open(TEST_PHOTO, "rb")
        data["photo"] = photo
        data["description"] = "Some text,text,... Testing some umlauts äüö and other special characters 晚上好 <javascript></javascript>"
        self.assertCreates(data, check = self.assertPhotoCreateSuccess)
        #=======================================================================
        # insert somthing that is not valid
        #=======================================================================
        del data["photo"]
        self.assertPhotoCreateError(data)
        #=======================================================================
        # delete some more
        #=======================================================================
        del data["title"]
        self.assertPhotoCreateError(data)
        
    def test_update(self):
        self.url = "/update-photo"
        #=======================================================================
        # test something valid without description
        #=======================================================================
        data = {"id" : 1,
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
        
    # hack around the fact that create photo will never return json
    def assertPhotoCreateSuccess(self, data):
        response = self.c.post(self.url, data)
        self.assertTrue("text/html" in response["Content-Type"])
        self.assertFalse("error" in response.content)
        photos = Photo.objects.all()
        photo = photos[len(photos) - 1]
        return {"id" : photo.pk}
        
    def assertPhotoCreateError(self, data):
        length = len(Photo.objects.all())
        response = self.c.post(self.url, data)
        self.assertTrue("text/html" in response["Content-Type"])
        self.assertTrue("error" in response.content)
        self.assertEqual(length, len(Photo.objects.all()))
