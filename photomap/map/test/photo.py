# -*- coding: utf8 -*-
'''
Created on Jun 29, 2012
@author: fredo
'''

from django.test import TestCase
from django.test.client import Client
from config import TEST_PASSWORD, TEST_USER
from map.model.photo import Photo
import config
import json
import logging 
import os

class PhotoTest(TestCase):
    fixtures = ['simple-test']
    
    logger = logging.getLogger(__name__)
    
    def setUp(self):
        self.c = Client()
        self.c.login(username = TEST_USER, password = TEST_PASSWORD)
        self.logger = PhotoTest.logger
        
    
    def test_delete(self):
        #=======================================================================
        # delete something that exists
        #=======================================================================
        path = Photo.objects.get(pk = 2).photo.path
        response = self.c.post("/delete-photo", {"id" : 2})
        self.assertEqual(response["Content-Type"], "text/json")
        content = json.loads(response.content)
        self.logger.debug("received %s" % (content))
        self.assertRaises(Photo.DoesNotExist, Photo.objects.get, id = 2)
        self.assertTrue(content["success"])
        self.assertFalse(os.path.exists(path))
        #=======================================================================
        # delete something that does not exist
        #=======================================================================
        response = self.c.post("/delete-photo", {"id":9999})
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        self.assertNotEqual(content["error"], "")
        #=======================================================================
        # use wrong paramater
        #=======================================================================
        response = self.c.post("/delete-photo", {"wrong" : "abc"})
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        self.assertNotEqual(content["error"], "")
        
        
    def test_insert(self):
        #=======================================================================
        # insert something valid without description
        #=======================================================================
        photo = open(config.TEST_PHOTO, "rb")
        data = {"place": 1,
                "title": "Chuck Norris",
                "photo" : photo}
        response = self.c.post("/insert-photo", data)
        content = json.loads(response.content)
        self.assertTrue(content["success"])
        self.assertEqual(len(Photo.objects.all()), 2)
        self.assertEqual(content["id"], 3)
        #=======================================================================
        # insert something valid with description
        #=======================================================================
        photo = open(config.TEST_PHOTO, "rb")
        data["photo"] = photo
        data["description"] = "Some text,text,... Testing some umlauts äüö and other special characters <javascript></javascript>"
        repsonse = self.c.post("/insert-photo", data)
        content = json.loads(repsonse.content)
        self.assertTrue(content["success"])
        self.assertEqual(content["id"], 4)
        #=======================================================================
        # insert somthing that is not valid
        #=======================================================================
        del data["photo"]
        response = self.c.post("/insert-photo", data)
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        self.assertRaises(KeyError, content.__getitem__, "id")
        #=======================================================================
        # delete some more
        #=======================================================================
        del data["title"]
        response = self.c.post("/insert-photo", data)
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        self.assertRaises(KeyError, content.__getitem__, "id")
        
    def test_update(self):
        #=======================================================================
        # test something valid without description
        #=======================================================================
        data = {"id" : 2,
                "title" : "EO changed"}
        response = self.c.post("/update-photo", data)
        content = json.loads(response.content)
        self.assertTrue(content["success"])
        self.assertEqual(Photo.objects.get(pk = 2).title, data["title"])
        #=======================================================================
        # with description
        #=======================================================================
        data["description"] = "The description changed"
        response = self.c.post("/update-photo", data)
        content = json.loads(response.content)
        self.assertTrue(content["success"])
        self.assertEqual(Photo.objects.get(pk = 2).description, data["description"])
        #=======================================================================
        # wrong id test
        #=======================================================================
        data["id"] = "does not exist"
        response = self.c.post("/update-photo", data)
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        self.assertNotEqual(content["error"], "")
        
