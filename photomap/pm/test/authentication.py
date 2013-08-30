'''
Created on Aug 30, 2013

@author: fredo
'''

from apitestcase import ApiTestCase
from data import TEST_EMAIL, TEST_PASSWORD

class AuthenticationViewTest(ApiTestCase):
    
    def test_login_with_next(self):
        self.client.logout()
        # Test template.
        response = self.request("/account/login/", method = "GET")
        self.assertEqual(response.status_code, 200)
        data = {"email" : TEST_EMAIL,
                "password": TEST_PASSWORD,
                "next" : "/account/"}
        response = self.request("/account/login/", data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.get("Location"), "http://testserver/account/")
        self.assertEqual(self.client.session.get("_auth_user_id"), 1)
        
    def test_login_without_next(self):
        self.client.logout()
        data = {"email" : TEST_EMAIL,
                "password" : TEST_PASSWORD,
                "next" : ""}
        response = self.request("/account/login/", data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.get("Location"), "http://testserver/dashboard/")
        
    def test_logout(self):
        response = self.request("/account/logout/", method = "GET")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.session.get("_auth_user_id"), None)
        
