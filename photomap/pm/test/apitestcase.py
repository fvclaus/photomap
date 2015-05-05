'''
Created on Jul 8, 2012

@author: fredo
'''

from django.test import TestCase
from django.test.client import Client
from data import ADMIN_PASSWORD, ADMIN_USER, ADMIN_EMAIL, TEST_USER, TEST_PASSWORD 

import logging
import json
from datetime import datetime
from time import mktime
from pm.model.photo import Photo
from django.contrib.auth.models import User
from django.conf import settings
from django.test.utils import override_settings
from pm.model.userprofile import UserProfile
from urllib import urlopen
from copy import deepcopy
import os

@override_settings(EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend')
class ApiTestCase(TestCase):
    """ loads the simple-test fixtures, appends a logger and logs the client in """
    
    fixtures = ['simple-test']
    logger = logging.getLogger(__name__)
    
        
    TIME_DELTA = 1000
    
    def createClient(self):
        return Client(HTTP_USER_AGENT = "Firefox/19")
    
    def setUp(self):
        self.client = self.createClient()
        self.ADMIN_EMAIL = ADMIN_EMAIL
        self.ADMIN_PASSWORD = ADMIN_PASSWORD
        self.assertTrue(self.client.login(username = ADMIN_USER, password = ADMIN_PASSWORD))
        self.logger = ApiTestCase.logger
        # Delete all leftover mails
        self.read_and_delete_mails()
                
    def tearDown(self):
        # remove all photos from s3 again
        photos = Photo.objects.all()
        if photos:
            photos.delete()

        
    def assertSuccess(self, url, data, method = "POST"):
        """ makes a request and checks if the json return is defined according to web api specification. returns content """
        content = self.json(url, data, method)
        self.assertTrue(content != None)
        if not content["success"]:
            self.assertTrue(content["success"], "Request is supposed to be successful but returned error: %s" % content["error"])
        self.assertRaises(KeyError, content.__getitem__, "error")
        return content
        
    def assertError(self, data = {}, method = "POST"):
        """ makes a request and checks if the json return is defined according to web api specification """
        if self.url:
            url = self.url
        if data.has_key("id"):
            url = self.url + str(data["id"]) + "/"
        content = self.json(url, data, method)
        self.assertTrue(content != None)
        self.assertFalse(content["success"])
        self.assertNotEqual(content["error"], "")
        self.assertEqual(len(content.keys()), 2)
        return content
    
    def assert404(self, url, method = "POST"):
        response = self.request(url, {}, method)
        self.assertEqual(response.status_code, 404)
        
    def assertLoginRequired(self, url, method):
        response = self.request(url, method = method, loggedin = False)
        self.assertTrue(response.has_header("location"))
        self.assertTrue(response.get("location").find("login") != -1)
        
    def assertCreates(self, data, model = None, check = None):
        if not model:
            model = self.getmodel()
    
        length = len(model.objects.all())
        if check is None:
            check = self.assertSuccess
        now = self.getunixtime()
        content = check(self.url, data)
        self.assertEqual(len(model.objects.all()), length + 1)
        instance = model.objects.all()[length]
        create = mktime(instance.date.timetuple())
        # we are assuming the datestamp of the object is around now
        self.assertAlmostEqual(now, create, delta = self.TIME_DELTA)
        self.assertEqual(instance.pk, content["id"])
        self.assertTrue(instance != None)
        return (instance, content)
    
    def assertPublicAccess(self, url, mime_type = "image/jpeg"):
        
        if url.startswith("/"):  
            c = self.createClient()
            response = c.get(url)
            code = response.status_code
        else:
            response = urlopen(url)
            code = response.getcode()
            if mime_type:
                self.assertEqual(response.headers.get("Content-Type"), mime_type)
            
        self.assertEqual(200, code)
        return response
    

    def assertNoPublicAccess(self, url):
        c = self.createClient()
        response = c.get(url)
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        
    def assertRedirect(self, response):
        self.assertEqual(response.status_code, 302)
        redirect_response = self.request(response.get("Location"), method = "GET")
        self.assertEqual(redirect_response.status_code, 200)
        
    def assertRedirectToComplete(self, response):
        self.assertTrue(response.get("Location").find("complete") != -1)
        self.assertRedirect(response)
        
    
    def assertUpdates(self, data, model = None):
        if not model:
            model = self.getmodel()
        
        length = len(model.objects.all())
        now = self.getunixtime()
        model_id = data["id"]
        # Do not alter input data.
        data_copy = deepcopy(data)
        del data_copy["id"]
        content = self.assertSuccess(self.url + str(model_id) + "/", data_copy)
        self.assertEqual(len(model.objects.all()), length)
        
#        if data.has_key("model_id"):
        updated_instances = model.objects.get(pk = model_id)
        updated = mktime(updated_instances.date.timetuple())
        self.assertNotAlmostEqual(now, updated, delta = self.TIME_DELTA, msg = "date is probably included in the form")
#        else:
#            updated_instances = None
            
        return (updated_instances, content)
    
    def assertDeletes(self, data, model = None):
        if not model:
            model = self.getmodel()
        
        length = len(model.objects.all())
        model_id = data["id"]
        # Do not alter input data.
        data_copy = deepcopy(data)
        del data_copy["id"]
        content = self.assertSuccess(self.url + str(model_id) + "/", data_copy, method = "DELETE")
        self.assertEqual(len(model.objects.all()), length - 1)
        self.assertRaises(model.DoesNotExist, model.objects.get, pk = model_id)
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
        url = urlopen(photo[2])
        self.assertEqual(url.getcode(), 403)
    
    def assertAlbumComplete(self, album): 
        self.assertDescriptionComplete(album)
        self.assertNotEqual(album["isOwner"], None)
        self.assertTrue(album["lat"])
        self.assertTrue(album["lon"])
        self.assertTrue(album["country"])
        self.assertTrue(album["secret"])
        
    def assertPlaceComplete(self, place):
        self.assertTrue(place["lat"])
        self.assertTrue(place["lon"])
    
    def assertPhotoComplete(self, photo):
        self.assertTrue(photo["photo"])
        self.assertTrue(int(photo["order"]) >= 0)
        self.assertTrue(photo["thumb"])
        self.assertTrue(photo["photo"] != photo["thumb"])
            
    def assertDescriptionComplete(self, instance):
        self.assertTrue(instance["title"])
        self.assertTrue(instance["id"])
        self.assertTrue(instance["description"])
        self.assertTrue(instance["date"])
    
    def login_test_user(self):
        self.client.login(username = TEST_USER, password = TEST_PASSWORD)
    
        
    def getmodel(self):
        if not self.model:
            raise RuntimeError("self.model is not defined and model was not in parameters")
        else:
            return self.model
        
    @property
    def user(self):
        # User could be modified during test cases
        return User.objects.all().get(username = ADMIN_EMAIL)
    
    @property
    def userprofile(self):
        # Userprofile could be modified during test cases
        return UserProfile.objects.get(user = self.user)
        
    def json(self, url, data = {} , method = "POST", loggedin = True):
        """ 
            @author: Frederik Claus
            @summary: makes a post request to url or self.url returns the content jsonified
        """ 
        response = self.request(url, data, method, loggedin)
        self.assertEqual(response["Content-Type"], "text/json")
        return json.loads(response.content)
    
    
    def read_and_delete_mails(self):
        mails = []

        if not os.path.exists(settings.EMAIL_FILE_PATH):
            os.mkdir(settings.EMAIL_FILE_PATH)

        for filename in os.listdir(settings.EMAIL_FILE_PATH):
            path = os.path.join(settings.EMAIL_FILE_PATH, filename)
            mail = open(path, "r")
            mails.append(mail.readlines())
            mail.close()
            os.remove(path)
        return mails
        
    
    
    def request (self, url, data = {}, method = "POST", loggedin = True):
        if loggedin:
            client = self.client
        else:
            client = self.createClient()
#        if not url:
#            if not self.url:
#                raise RuntimeError("self.url is not defined and url was not in parameters")
#            url = self.url
        if method == "POST":
            response = client.post(url, data)
        elif method == "GET":
            response = client.get(url, data)
        elif method == "DELETE":
            response = client.delete(url, data)
        return response
    
    def getunixtime(self):
        return mktime(datetime.now().timetuple()) 
    
    def getloggedoutclient(self):
        return self.createClient()
        
