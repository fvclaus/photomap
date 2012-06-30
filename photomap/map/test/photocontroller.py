'''
Created on Jun 29, 2012

@author: fredo
'''

from django.utils import unittest
from django.test.client import Client
import json

class PhotoController(unittest.TestCase):
    
    def test_insert(self):
        client = Client()
        response = client.post("/insert-photo", {"id" : 1})
        self.assertEqual(response["Content-Type"], "text/json")
        content = json.loads(response.content)
        self.assertFalse(content["success"])
        
