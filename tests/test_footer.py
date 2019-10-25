from .apitestcase import ApiTestCase


class FooterViewTest(ApiTestCase):

    def setUp(self):
        super().setUp()
        self.url = "/contact/"
        self.data = {"name": "Test",
                     "email": "test@keiken.de",
                     "subject": "Is the contact form working?",
                     "message": "This should appear in the second line!"}

    def test_contact(self):
        response = self.client.post(self.url, self.data)
        self.assertRedirectToComplete(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)

    def test_contact_missing_message(self):
        del self.data["message"]
        response = self.client.post(self.url, self.data)
        self.assertNoRedirect(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 0)
