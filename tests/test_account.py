from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode

from .apitestcase import USER1_EMAIL, USER1_PASSWORD, ApiTestCase


class AccountViewTest(ApiTestCase):

    def test_delete_test_user(self):
        """Deleting test user should be prohibited"""
        self.login_test_user()
        response = self.request(reverse('account_delete'),
                                {"user_email": settings.TEST_USER_EMAIL,
                                 "user_password": settings.TEST_USER_PASSWORD})
        self.assertNoRedirect(response)
        self.assertUserExists(USER1_EMAIL)

    def test_update_password_test_user(self):
        """Updating password for test user should be prohibited"""
        self.client.logout()
        self.login_test_user()
        response = self.request(reverse('password_change'),
                                {"old_password": settings.TEST_USER_PASSWORD,
                                 "new_password1": "test2",
                                 "new_password2": "test2"})
        self.assertNoRedirect(response)

    def test_request_reset_password_test_user(self):
        """Requesting password reset for test user should be prohibited"""
        self.client.logout()
        response = self.request(reverse('password_reset'),
                                {"email": settings.TEST_USER_EMAIL})
        self.assertNoRedirect(response)

    def test_update_password(self):
        response = self.request(reverse('password_change'),
                                {"old_password": USER1_PASSWORD,
                                 "new_password1": "test2",
                                 "new_password2": "test2"})
        self.assertRedirect(response, reverse("password_change_done"))
        self.assertTrue(self.user.check_password("test2"))

    def test_delete_user_with_questionaire(self):
        response = self.request(reverse('account_delete'),
                                {"user_email": USER1_EMAIL,
                                 "user_password": USER1_PASSWORD,
                                 "cause": "Just testing!"})
        self.assertRedirect(response, reverse('account-delete-complete'))
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0].to, [USER1_EMAIL])
        self.assertEqual(messages[1].to, [settings.ADMINS[0][1]])
        self.assertUserDoesNotExist(USER1_EMAIL)

    def test_delete_user_without_questionaire(self):
        response = self.request(reverse('account_delete'),
                                {"user_email": USER1_EMAIL,
                                 "user_password": USER1_PASSWORD})
        self.assertRedirect(response, reverse('account-delete-complete'))
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].to, [USER1_EMAIL])
        self.assertUserDoesNotExist(USER1_EMAIL)

    def generate_reset_url(self, user_email):
        user = User.objects.get(email=user_email)
        uid = urlsafe_base64_encode(str(user.pk).encode()).decode('ascii')
        token = default_token_generator.make_token(user)
        return reverse('password_reset_confirm', args=[uid, token])

    def test_request_reset_password(self):
        self.client.logout()
        response = self.request(reverse('password_reset'),
                                {"email": USER1_EMAIL})
        self.assertRedirect(response, reverse('password_reset_done'))
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)
        self.assertTrue(self.generate_reset_url(
            USER1_EMAIL) in messages[0].body)

    def test_reset_password(self):
        self.client.logout()
        response = self.sendGET(self.generate_reset_url(USER1_EMAIL))
        self.assertRedirect(response)
        reset_password_url = response.url
        data = {"new_password1": "12",
                "new_password2": "other"}
        response = self.request(reset_password_url, data)
        self.assertEqual(response.status_code, 200)
        data["new_password2"] = "12"
        response = self.request(reset_password_url, data)
        self.assertRedirect(response)
        self.assertTrue(self.user.check_password("12"))
