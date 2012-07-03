'''
Created on Jun 29, 2012

@author: fredo
'''

from django.test import TestCase
from django.test.client import Client
from config import TEST_PASSWORD, TEST_USER
import json
import logging 

class Photo(TestCase):
    fixtures = ['simple-test']
    
    logger = logging.getLogger(__name__)
    
    def setUp(self):
        self.c = Client()
        self.c.login(username = TEST_USER, password = TEST_PASSWORD)
        self.logger = Photo.logger
        
    
    def test_delete(self):
        #=======================================================================
        # delete something that exists
        #=======================================================================
        response = self.c.post("/delete-photo", {"id" : 2})
        self.assertEqual(response["Content-Type"], "text/json")
        content = json.loads(response.content)
        self.logger.debug("received %s" % (content))
        self.assertTrue(content["success"])
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
        pass
