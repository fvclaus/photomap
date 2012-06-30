'''
Created on Jun 29, 2012

@author: fredo
'''

from django.utils import unittest


class PhotoController(unittest.TestCase):
    
    def test_main(self):
        self.assertFalse(True, "fail")
        return True