'''
Created on Aug 29, 2013

@author: fredo
'''

from apitestcase import ApiTestCase
from django.contrib.auth.models import User

class AccountControllerTest(ApiTestCase):
    
    def test_update_password(self):
        self.url = "/account/password/"
        data = {"old_password" : self.TEST_PASSWORD,
                "new_password" : "admin2",
                "new_password_repeat" : "admin2"}
        self.assertSuccess(self.url, data)
        self.assertTrue(self.user.check_password(data["new_password"]))
        self.user.set_password(data["old_password"])
        self.user.save()
        #=======================================================================
        # Something invalid
        #=======================================================================
        data["new_password_repeat"] = "admin21"
        self.assertError(data)
        
    def test_update_mail(self):
        self.url = "/account/email/"
        data = {"new_email" : "admin2@keiken.de",
                "confirm_password" : self.TEST_PASSWORD}
        self.assertSuccess(self.url, data)
        self.assertEqual(self.user.email, data["new_email"])
        #=======================================================================
        # No valid email
        #=======================================================================
        data["new_email"] = "admin2@keiken"
        self.assertError(data)
        #=======================================================================
        # Old email
        #=======================================================================
        data["new_email"] = "admin2@keiken.de"
        self.assertError(data)
        #=======================================================================
        # Wrong password
        #=======================================================================
        data = {"new_email" : "admin3@keiken.de",
                "confirm_password" : "wrong"}
        self.assertError(data)

    def checkUser(self):
        print self.user
        
    def test_delete_user_with_questionaire(self):
        self.url = "/account/delete"
        data = {"user_email" : self.TEST_EMAIL,
                "user_password" : self.TEST_PASSWORD,
                "cause" : "Just testing!"}
        response = self.request(self.url, data)
        self.assertRedirectToSuccess(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 2)
        self.assertRaises(User.DoesNotExist, self.checkUser)
        
    def test_delete_user_without_questionaire(self):
        self.url = "/account/delete"
        data = {"user_email" : self.TEST_EMAIL,
                "user_password" : self.TEST_PASSWORD}
        response = self.request(self.url, data)
        self.assertRedirectToSuccess(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)
        self.assertRaises(User.DoesNotExist, self.checkUser)
