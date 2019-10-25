import json
import logging
import os
from copy import copy
from datetime import datetime
from decimal import Decimal
from time import mktime
from urllib.request import urlopen

from django.conf import settings
from django.core import mail
from django.test import TestCase
from django.test.client import Client
from pm.models import Photo, UserProfile
from pm.models.user import User

ADMIN_EMAIL = "admin@keiken.de"
ADMIN_PASSWORD = "admin"

USER1_EMAIL = "user1@keiken.de"
USER1_PASSWORD = "test"

INACTIVE_USER_EMAIL = "inactive-user@keiken.de"
INACTIVE_USER_PASSWORD = "test"


TEST_PHOTO = os.path.join(settings.TEST_PATH, "test.jpeg")
TEST_PHOTO_WATER = os.path.join(settings.TEST_PATH, "water.jpeg")
TEST_PHOTO_MOUNTAIN = os.path.join(settings.TEST_PATH, "mountain.jpeg")

QUANTIZE_EXPONENT = Decimal("0.0000001")

GPS_MANNHEIM_SCHLOSS = {"lat": Decimal(48.01230012).quantize(QUANTIZE_EXPONENT),
                        "lon": Decimal(8.0123123).quantize(QUANTIZE_EXPONENT)}


class ApiTestCase(TestCase):
    """ loads the simple-test fixtures, appends a logger and logs the client in """

    fixtures = ['simple-test']
    logger = logging.getLogger(__name__)

    TIME_DELTA = 1000

    def createClient(self):
        return Client()

    def setUp(self):
        self.client = self.createClient()
        self.assertTrue(self.client.login(
            username=USER1_EMAIL, password=USER1_PASSWORD))
        self.logger = ApiTestCase.logger
        # Delete all leftover mails
        self.read_and_delete_mails()

    def tearDown(self):
        # remove all photos from s3 again
        photos = Photo.objects.all()
        if photos:
            photos.delete()

    def assertSuccess(self, url, data, method="POST"):
        """ makes a request and checks if the json return is defined according to web api specification. returns content """
        content = self.json(url, data, method)
        self.assertTrue(content is not None)
        if not content["success"]:
            self.assertTrue(
                content["success"], "Request is supposed to be successful but returned error: %s" % content["error"])
        self.assertRaises(KeyError, content.__getitem__, "error")
        return content

    def assertError(self, data={}, method="POST"):
        """ makes a request and checks if the json return is defined according to web api specification """
        if self.url:
            url = self.url
        if "id" in data:
            url = self.url + str(data["id"]) + "/"
        content = self.json(url, data, method)
        self.assertTrue(content is not None)
        self.assertFalse(content["success"])
        self.assertNotEqual(content["error"], "")
        self.assertEqual(len(content.keys()), 2)
        return content

    def assert404(self, url, method="POST"):
        response = self.request(url, {}, method)
        self.assertEqual(response.status_code, 404)

    def assertLoginRequired(self, url, method):
        response = self.request(url, method=method, loggedin=False)
        self.assertTrue(response.has_header("location"))
        self.assertTrue(response.get("location").find("login") != -1)

    def assertUserExists(self, email):
        self.assertEqual(len(User.objects.filter(email=email)), 1)

    def assertUserDoesNotExist(self, email):
        self.assertEqual(len(User.objects.filter(email=email)), 0)

    def assertCreates(self, data, model=None, check=None):
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
        self.assertAlmostEqual(now, create, delta=self.TIME_DELTA)
        self.assertEqual(instance.pk, content["id"])
        self.assertTrue(instance is not None)
        return (instance, content)

    def assertPublicAccess(self, url, mime_type="image/jpeg"):

        if url.startswith("/"):
            c = self.createClient()
            response = c.get(url)
            code = response.status_code
        else:
            response = urlopen(url)
            code = response.getcode()
            if mime_type:
                self.assertEqual(response.headers.get(
                    "Content-Type"), mime_type)

        self.assertEqual(200, code)
        return response

    def assertNoPublicAccess(self, url):
        c = self.createClient()
        response = c.get(url)
        content = json.loads(response.content)
        self.assertFalse(content["success"])

    def assertNoRedirect(self, response):
        self.assertFalse(str(response.status_code).startswith('3'))

    # TODO Remove the url check
    def assertRedirect(self, response, url=None):
        if url is not None:
            self.assertEqual(response.url, url)
        self.assertIn(response.status_code, (301, 302))
        redirect_response = self.request(
            response.get("Location"), method="GET")
        self.assertEqual(redirect_response.status_code, 200)

    def assertRedirectToComplete(self, response):
        self.assertTrue(response.get("Location").find("complete") != -1)
        self.assertRedirect(response)

    def assertUpdates(self, data, model=None):
        if not model:
            model = self.getmodel()

        length = len(model.objects.all())
        now = self.getunixtime()
        model_id = data["id"]
        # Do not alter input data.
        data_copy = copy(data)
        del data_copy["id"]
        content = self.assertSuccess(self.url + str(model_id) + "/", data_copy)
        self.assertEqual(len(model.objects.all()), length)

#        if data.has_key("model_id"):
        updated_instances = model.objects.get(pk=model_id)
        updated = mktime(updated_instances.date.timetuple())
        self.assertNotAlmostEqual(
            now, updated, delta=self.TIME_DELTA, msg="date is probably included in the form")
#        else:
#            updated_instances = None

        return (updated_instances, content)

    def assertDeletes(self, data, model=None):
        if not model:
            model = self.getmodel()

        length = len(model.objects.all())
        model_id = data["id"]
        # Do not alter input data.
        data_copy = copy(data)
        del data_copy["id"]
        content = self.assertSuccess(
            self.url + str(model_id) + "/", data_copy, method="DELETE")
        self.assertEqual(len(model.objects.all()), length - 1)
        self.assertRaises(model.DoesNotExist, model.objects.get, pk=model_id)
        return content

    def assertDoesNotExist(self, pk, model=None):
        if not model:
            model = self.model
        self.assertRaises(model.DoesNotExist, model.objects.get, pk=pk)

    def assertAlbumComplete(self, album):
        self.assertDescriptionComplete(album)
        self.assertNotEqual(album["isOwner"], None)
        self.assertTrue(album["lat"])
        self.assertTrue(album["lon"])
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
        self.assertTrue(self.client.login(username=settings.TEST_USER_EMAIL,
                                          password=settings.TEST_USER_PASSWORD))

    def getmodel(self):
        if not self.model:
            raise RuntimeError(
                "self.model is not defined and model was not in parameters")
        else:
            return self.model

    @property
    def user(self):
        return User.objects.get(email=USER1_EMAIL)

    @property
    def userprofile(self):
        # Userprofile could be modified during test cases
        return UserProfile.objects.get(user=self.user)

    def json(self, url, data={}, method="POST", loggedin=True):
        response = self.request(url, data, method, loggedin)
        self.assertEqual(response["Content-Type"], "text/json",
                         "Expected json, but returned content %s" % response.content)
        return json.loads(response.content)

    def read_and_delete_mails(self):
        mails = mail.outbox
        for mail_mail in mails:
            print(mail_mail.to)
            print(mail_mail.subject)
        mail.outbox = []
        return mails
        # mails = []
        #
        # if not os.path.exists(settings.EMAIL_FILE_PATH):
        #     os.mkdir(settings.EMAIL_FILE_PATH)
        #
        # for filename in os.listdir(settings.EMAIL_FILE_PATH):
        #     path = os.path.join(settings.EMAIL_FILE_PATH, filename)
        #     mail = open(path, "r")
        #     mails.append(mail.readlines())
        #     mail.close()
        #     os.remove(path)
        # return mails

    def sendGET(self, url, data={}):
        return self.client.get(url, data)

    def request(self, url, data={}, method="POST", loggedin=True):
        if loggedin:
            client = self.client
        else:
            client = self.createClient()
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
