'''
Created on Aug 29, 2013

@author: Frederik Claus
'''

from apitestcase import ApiTestCase

class FooterViewTest(ApiTestCase):
    
    def test_contact(self):
        data = {"name" : "Test",
                "email" : "test@keiken.de",
                "subject" : "Is the contact form working?",
                "message" : "This should appear in the second line!" }
        
        response = self.client.post("/contact/", data)
        self.assertRedirectToComplete(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)
        #=======================================================================
        # Something invalid
        #=======================================================================
        del data["message"]
        response = self.client.post("/contact/", data)
        # No redirect
        self.assertEqual(response.status_code, 200)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 0)
        
        
        
