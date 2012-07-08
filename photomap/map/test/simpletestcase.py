'''
Created on Jul 8, 2012

@author: fredo
'''

from django.test import TestCase
from django.test.client import Client
from config import TEST_PASSWORD, TEST_USER

import logging
import json


class SimpleTestCase(TestCase):
    """ loads the simple-test fixtues, appends a logger and logs the client in """
    
    fixtures = ['simple-test']
    
    logger = logging.getLogger(__name__)
    
    def setUp(self):
        self.c = Client()
        self.c.login(username = TEST_USER, password = TEST_PASSWORD)
        self.logger = SimpleTestCase.logger
        
    def assertSuccess(self, data):
        """ makes a request and checks if the json return is defined according to web api specification. returns content """
        content = self.json(data)
        self.assertTrue(content != None)
        self.assertTrue(content["success"])
        self.assertRaises(KeyError, content.__getitem__, "error")
        return content
        
    def assertError(self, data):
        """ makes a request and checks if the json return is defined according to web api specification """
        content = self.json(data)
        self.assertTrue(content != None)
        self.assertFalse(content["success"])
        self.assertNotEqual(content["error"], "")
        self.assertEqual(len(content.keys()), 2)
        return content
    
    def assertCreates(self, data, model = None):
        if not model:
            model = self.getmodel()
    
        length = len(model.objects.all())
        content = self.assertSuccess(data)
        self.assertEqual(len(model.objects.all()), length + 1)
        instance = model.objects.all()[length]
        self.assertEqual(instance.pk, content["id"])
        self.assertTrue(instance != None)
        return (instance, content)
    
    def assertUpdates(self, data, model = None):
        if not model:
            model = self.getmodel()
        
        length = len(model.objects.all())
        content = self.assertSuccess(data)
        self.assertEqual(len(model.objects.all()), length)
        instance = model.objects.get(pk = data["id"])
        return (instance, content)
    
    def assertDeletes(self, data, model = None):
        if not model:
            model = self.getmodel()
        
        length = len(model.objects.all())
        content = self.assertSuccess(data)
        self.assertEqual(len(model.objects.all()), length - 1)
        self.assertRaises(model.DoesNotExist, model.objects.get, pk = data["id"])
        return content
    
    def getmodel(self):
        if not self.model:
            raise RuntimeError("self.model is not defined and model was not in parameters")
        else:
            return self.model
        
    def json(self, data , url = None):
        """ makes a post request to url or self.url returns the content jsonified""" 
        if not url:
            if not self.url:
                raise RuntimeError("self.url is not defined and url was not in parameters")
            url = self.url
    
        response = self.c.post(url, data)
        self.assertEqual(response["Content-Type"], "text/json")
        return json.loads(response.content)
        
