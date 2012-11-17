# -*- coding: utf-8 -*-
'''
Created on Jun 29, 2012
@author: fredo
'''

from apitestcase import ApiTestCase
from django.test.client import Client
from data import TEST_PASSWORD, TEST_USER,TEST_PHOTO
from pm.model.photo import Photo

import json
import logging 
import os
from copy import deepcopy

class PhotoControllerTest(ApiTestCase):
        
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
        photo = (photo.pk,photo.getphotourl())
        self.assertDeletes({"id" : 1})
        self.assertPhotoDeleted(photo)
        #=======================================================================
        # delete something that does not exist
        #=======================================================================
        self.assertError({"id":9999})
        #=======================================================================
        # something that does not belong to you
        #=======================================================================
        self.assertError({"id":2})
        #=======================================================================
        # use wrong paramater
        #=======================================================================
        self.assertError({"wrong" : "abc"})
        
        
        
    def test_insert(self):
        self.url = "/insert-photo"
        #=======================================================================
        # insert something valid without description
        #=======================================================================
        data = {"place": 1,
                "title": "Chuck Norris"}
        self._openphoto(data)
        (photo, content) = self.assertCreates(data)
        self.assertEqual(photo.title, data["title"])
        self.assertEqual(photo.order,1)
        self.assertPublicAccess(content["url"])
        #=======================================================================
        # insert something valid with description
        #=======================================================================
        self._openphoto(data)
        data["description"] = "Some text,text,... Testing some umlauts äüö and other special characters 晚上好 <javascript></javascript>"
        (photo,content) = self.assertCreates(data)
        self.assertEqual(photo.description, data["description"])
        self.assertEqual(photo.order,2)
        self.assertPublicAccess(content["url"])
        #=======================================================================
        # insert somthing that is not valid
        #=======================================================================
        data2 = deepcopy(data)
        self._openphoto(data2)
        del data2["photo"]
        self.assertError(data2)
        #=======================================================================
        # delete some more
        #=======================================================================
        data3 = deepcopy(data)
        self._openphoto(data3)
        del data3["title"]
        self.assertError(data3)
        #=======================================================================
        # delete something else
        #=======================================================================
        data4 = deepcopy(data)
        self._openphoto(data4)
        del data4["place"]
        self.assertError(data4)
        #=======================================================================
        # insert into somebody elses place
        #=======================================================================
        data5 = deepcopy(data)
        self._openphoto(data5)
        data5["place"] = 2
        self.assertError(data5)
        
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
        # somebody elses photo
        #=======================================================================
        data["id"] = 2
        self.assertError(data)
        #=======================================================================
        # wrong id test
        #=======================================================================
        data["id"] = 999 # does not exist
        self.assertError(data)
        
    # hack around the fact that create photo will never return json
#    this has gone obsolete since the introduction of html5 video upload
#    def assertPhotoCreateSuccess(self, data):
#        response = self.c.post(self.url, data)
#        self.assertTrue("text/html" in response["Content-Type"])
#        self.assertFalse("error" in response.content)
#        photos = Photo.objects.all()
#        photo = photos[len(photos) - 1]
#        return {"id" : photo.pk}
        
#    obsolete since html5 video upload
#    def assertPhotoCreateError(self, data):
#        length = len(Photo.objects.all())
#        response = self.c.post(self.url, data)
#        self.assertTrue("text/html" in response["Content-Type"])
#        self.assertTrue("error" in response.content)
#        self.assertEqual(length, len(Photo.objects.all()))
    
    def _openphoto(self,data):
        photo = open(TEST_PHOTO,"rb")
        data["photo"] = photo
