# -*- coding: utf-8 -*-
'''
Created on Jun 29, 2012
@author: fredo
'''

from apitestcase import ApiTestCase
from data import  TEST_PHOTO
from pm.model.photo import Photo

import json
import os
from copy import deepcopy
import urllib2

class PhotoControllerTest(ApiTestCase):
        
    model = Photo
    UPLOAD_LIMIT = 367001600
    
    def test_delete(self):
        #=======================================================================
        # define url for requests
        #=======================================================================
        self.url = "/photo/"
        #=======================================================================
        # delete something that exists
        #=======================================================================
        photo = Photo.objects.get(pk = 1)
        photo_size = photo.size
        photo = (photo.pk, photo.getphotourl(), photo.getthumburl())
        self.assertDeletes({"id" : 1})
        self.assertPhotoDeleted(photo)
        self.assertEqual(self.userprofile.used_space, 659592 - photo_size)
        #=======================================================================
        # delete something that does not exist
        #=======================================================================
        self.assertError({"id":9999})
        #=======================================================================
        # something that does not belong to you
        #=======================================================================
        self.assertError({"id":100})
        #=======================================================================
        # use wrong paramater
        #=======================================================================
        self.assert404("/photo/abc/", method = "DELETE")
        
        
        
    def test_insert(self):
        self.url = "/photo/"
        #=======================================================================
        # insert something valid without description
        #=======================================================================
        data = {"place": 1,
                "title": "Chuck Norris",
                }
        self._openphoto(data)
        (photo, content) = self.assertCreates(data)
        self.assertEqual(photo.title, data["title"])
        self.assertEqual(photo.order, 0)
        self.assertPublicAccess(content["thumb"])
        self.assertPublicAccess(content["photo"])
        self.assertThumbSize(content["thumb"])
        self.assertEqual(content["order"], 0)
        self.assertEqual(photo.size, self._get_photo_size())
        self.assertEqual(self.userprofile.used_space, 4 * 164898 + self._get_photo_size())
        #=======================================================================
        # insert something valid with description
        #=======================================================================
        self._openphoto(data)
        data["description"] = u'Some text,text,... Testing some umlauts äüö and other special characters 晚上好 <javascript></javascript>'
        (photo, content) = self.assertCreates(data)
        self.assertEqual(photo.description, data["description"])
        self.assertEqual(photo.order, 0)
        self.assertEqual(photo.size, self._get_photo_size())
        self.assertPublicAccess(content["photo"])
        self.assertPublicAccess(content["thumb"])
        self.assertEqual(content["order"], 0)
        self.assertThumbSize(content["thumb"])
        self.assertEqual(self.userprofile.used_space, 4 * 164898 + 2 * self._get_photo_size())
        #=======================================================================
        # try to upload over the limit
        #=======================================================================
        self._openphoto(data)
        userprofile = self.userprofile
        userprofile.used_space = self.UPLOAD_LIMIT - 20
        userprofile.save()
        self.assertError(data)
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
        self.url = "/photo/"
        #=======================================================================
        # test something valid without description
        #=======================================================================
        data = {"id" : 1,
                "title" : "EO changed",
                "order" : 1}
        (photo, content) = self.assertUpdates(data)
        self.assertEqual(photo.title, data["title"])
        self.assertEqual(self.userprofile.used_space, 4 * 164898)
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
        data["id"] = 100
        self.assertError(data)
        #=======================================================================
        # Wrong id test
        #=======================================================================
        data["id"] = 999  # does not exist
        self.assertError(data)
        #=======================================================================
        # Use wrong parameter.
        #=======================================================================
        self.assert404("/photo/abc/", method = "POST")
        
    def test_update_multiple(self):
        self.url = "/photos"
        #=======================================================================
        # something valid
        #=======================================================================
        data = [{"id" : 1,
                 "title" : "New title 1",
                 "order" : 1 },
                {"id" : 2,
                 "title" : "New title 2",
                 "order" : 0 }]
        ids = [1, 2]
                
        self.assertSuccess(self.url, {"photos" : json.dumps(data)})
        photos = self._get_photos(ids)
        self.assertEqual(photos[0].title, data[0]["title"])
        self.assertEqual(photos[0].order, data[0]["order"])
        self.assertEqual(photos[1].title, data[1]["title"])
        self.assertEqual(photos[1].order, data[1]["order"])
        self.assertEqual(self.userprofile.used_space, 4 * 164898)
        #=======================================================================
        # with description
        #=======================================================================
        data[0]["description"] = "The description changed"
        self.assertSuccess(self.url, {"photos" : json.dumps(data)})
        photos = self._get_photos(ids)
        self.assertEqual(photos[0].description, data[0]["description"])
        #=======================================================================
        # Not owner
        #=======================================================================
        data[0]["id"] = 100
        self.assertError({"photos" : json.dumps(data)})
        #=======================================================================
        # Wrong id test
        #=======================================================================
        data[0]["id"] = 999  # does not exist
        self.assertError({"photos" : json.dumps(data)})
        #=======================================================================
        # Invalid json test
        #=======================================================================
        data = "This is {aa; not Js0n"
        self.assertError({"photos" : data})

    def _get_photos(self, ids):
        photos = []
        for id in ids:
            photos.append(Photo.objects.get(pk = id))
        return photos
    
    def assertThumbSize(self, thumb_url):
        from PIL import Image
        import tempfile
        url_data = urllib2.urlopen(thumb_url)
        thumb, name = tempfile.mkstemp(suffix = ".jpg", text = False)
        thumb = open(name, "wb")
        thumb.write(url_data.read())
        thumb.close()
        
        thumb = Image.open(name)
        self.assertTrue(thumb.size[0] is 100 or thumb.size[1] is 100)
        
        
    def _openphoto(self, data):
        photo = open(TEST_PHOTO, "rb")
        data["photo"] = photo
        
    def _get_photo_size(self):
        return os.stat(TEST_PHOTO).st_size
