'''
Created on Jul 8, 2012

@author: fredo
'''

from django.test import TestCase
from django.test.client import Client
from data import TEST_PASSWORD, TEST_USER

import logging
import json
from datetime import datetime
from time import mktime
from pm.model.photo import Photo
import os
from urllib import urlopen

class SimpleTestCase(TestCase):
    """ loads the simple-test fixtues, appends a logger and logs the client in """
    
    fixtures = ["user", 'simple-test']
    
    logger = logging.getLogger(__name__)
    
    TIME_DELTA = 1000
    
    def setUp(self):
        self.c = Client()
        self.assertTrue(self.c.login(username = TEST_USER, password = TEST_PASSWORD))
        self.logger = SimpleTestCase.logger
        
    def assertSuccess(self, data):
        """ makes a request and checks if the json return is defined according to web api specification. returns content """
        content = self.json(data)
        self.assertTrue(content != None)
        self.assertTrue(content["success"])
        self.assertRaises(KeyError, content.__getitem__, "error")
        return content
        
    def assertError(self, data, method = "POST"):
        """ makes a request and checks if the json return is defined according to web api specification """
        content = self.json(data, method = method)
        self.assertTrue(content != None)
        self.assertFalse(content["success"])
        self.assertNotEqual(content["error"], "")
        self.assertEqual(len(content.keys()), 2)
        return content
    
    def assertCreates(self, data, model = None, check = None):
        if not model:
            model = self.getmodel()
    
        length = len(model.objects.all())
        if check is None:
            check = self.assertSuccess
        now = self.getunixtime()
        content = check(data)
        self.assertEqual(len(model.objects.all()), length + 1)
        instance = model.objects.all()[length]
        create = mktime(instance.date.timetuple())
        # we are assuming the datestamp of the object is around now
        self.assertAlmostEqual(now, create, delta = self.TIME_DELTA)
        self.assertEqual(instance.pk, content["id"])
        self.assertTrue(instance != None)
        return (instance, content)
    
    def assertPublicAccess(self, url):
        c = Client()
        response = c.get(url)
        self.assertEqual(200, response.status_code)
        
    def assertNoPublicAccess(self, url):
        c = Client()
        response = c.get(url)
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        
    
    def assertUpdates(self, data, model = None):
        if not model:
            model = self.getmodel()
        
        length = len(model.objects.all())
        now = self.getunixtime()
        content = self.assertSuccess(data)
        
        self.assertEqual(len(model.objects.all()), length)
        instance = model.objects.get(pk = data["id"])
        updated = mktime(instance.date.timetuple())
        self.assertNotAlmostEqual(now, updated, delta = self.TIME_DELTA, msg = "date is probably included in the form")
        return (instance, content)
    
    def assertDeletes(self, data, model = None):
        if not model:
            model = self.getmodel()
        
        length = len(model.objects.all())
        content = self.assertSuccess(data)
        self.assertEqual(len(model.objects.all()), length - 1)
        self.assertRaises(model.DoesNotExist, model.objects.get, pk = data["id"])
        return content
    
    def assertDoesNotExist(self, pk, model = None):
        if not model:
            model = self.model
        self.assertRaises(model.DoesNotExist, model.objects.get, pk = pk)
        
    def assertPhotoDeleted(self, photo):
        self.assertDoesNotExist(photo[0], model = Photo)
        url = urlopen(photo[1])
#        s3 error for access denied
        self.assertEqual(url.getcode(), 403)
    
    def assertAlbumComplete(self, album): 
        self.assertDescriptionComplete(album)
        self.assertNotEqual(album["isOwner"], None)
        self.assertTrue(album["lat"])
        self.assertTrue(album["lon"])
        self.assertTrue(album["country"])
        
    def assertPlaceComplete(self, place):
        self.assertTrue(place["lat"])
        self.assertTrue(place["lon"])
    
    def assertPhotoComplete(self, photo):
        self.assertTrue(photo["photo"])
        self.assertTrue(photo["order"])
        self.assertTrue(photo["thumb"])
            
    def assertDescriptionComplete(self, instance):
        self.assertTrue(instance["title"])
        self.assertTrue(instance["id"])
        self.assertTrue(instance["description"])
        self.assertTrue(instance["date"])
        
    def getmodel(self):
        if not self.model:
            raise RuntimeError("self.model is not defined and model was not in parameters")
        else:
            return self.model
        
    def json(self, data = {} , url = None, method = "POST", loggedin = True):
        """ 
            @author: Frederik Claus
            @summary: makes a post request to url or self.url returns the content jsonified
        """ 
        if loggedin:
            client = self.c
        else:
            client = Client()
        if not url:
            if not self.url:
                raise RuntimeError("self.url is not defined and url was not in parameters")
            url = self.url
        if method == "POST":
            response = client.post(url, data)
        elif method == "GET":
            response = client.get(url, data)
            
        self.assertEqual(response["Content-Type"], "text/json")
        return json.loads(response.content)
    
    def getunixtime(self):
        return mktime(datetime.now().timetuple()) 
    
    def getloggedoutclient(self):
        return Client()
        
