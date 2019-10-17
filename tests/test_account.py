from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator

from .apitestcase import ApiTestCase
from .data import ADMIN_EMAIL, ADMIN_PASSWORD, TEST_PASSWORD, TEST_USER


class AccountViewTest(ApiTestCase):

    def test_update_password_test_user(self):
        self.login_test_user()
        data = {"old_password": TEST_PASSWORD,
                "new_password1": "test2",
                "new_password2": "test2"}
        response = self.client.post("/account/password_change", data)
        self.assertRedirect(response)
        self.assertTrue(self.user.check_password(TEST_PASSWORD))

    def test_update_password(self):
        self.url = "/account/password_change/"
        data = {"old_password": self.ADMIN_PASSWORD,
                "new_password1": "admin2",
                "new_password2": "admin2"}
        response = self.client.post(self.url, data)
        self.assertRedirect(response)
        self.assertTrue(self.user.check_password(data["new_password1"]))

    def test_update_mail(self):
        self.url = "/account/email/"
        data = {"new_email": "admin2@keiken.de",
                "confirm_password": self.ADMIN_PASSWORD}
        self.assertError(data)
        # This is currently disabled, because their is no confirmation of the other email.
#        self.assertSuccess(self.url, data)
#        self.assertEqual(User.objects.get(username = data["new_email"]).username, data["new_email"])
#        # =======================================================================
#        # No valid email
#        # =======================================================================
#        data["new_email"] = "admin2@keiken"
#        self.assertError(data)
#        # =======================================================================
#        # Email from sb else
#        # =======================================================================
#        data["new_email"] = "test@keiken.de"
#        self.assertError(data)
#        # =======================================================================
#        # Wrong password
#        # =======================================================================
#        data = {"new_email" : "admin3@keiken.de",
#                "confirm_password" : "wrong"}
#        self.assertError(data)
#        # =======================================================================
#        # Test account modification not allowed.
#        # =======================================================================
#        self.login_test_user()
#        data = {"new_email" : "somthing@else.com",
#                "confirm_password" : TEST_PASSWORD}
#        self.assertError(data)

    def checkUser(self):
        print(self.user)

    def test_delete_test_user(self):
        self.login_test_user()
        data = {"user_email": TEST_USER,
                "user_password": TEST_PASSWORD}
        response = self.request("/account/delete", data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(User.objects.filter(username=TEST_USER)), 1)

    def test_delete_user_with_questionaire(self):
        self.url = "/account/delete"
        data = {"user_email": self.ADMIN_EMAIL,
                "user_password": self.ADMIN_PASSWORD,
                "cause": "Just testing!"}
        response = self.request(self.url, data)
        self.assertRedirectToComplete(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 2)
        self.assertRaises(User.DoesNotExist, self.checkUser)

    def test_delete_user_without_questionaire(self):
        self.url = "/account/delete"
        data = {"user_email": self.ADMIN_EMAIL,
                "user_password": self.ADMIN_PASSWORD}
        response = self.request(self.url, data)
        self.assertRedirectToComplete(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)
        self.assertRaises(User.DoesNotExist, self.checkUser)

    def test_request_reset_password(self):
        self.url = "/account/password/reset"
        self.client.logout()
        response = self.request(self.url, method="GET")
        self.assertEqual(response.status_code, 200)
        response = self.request(self.url, {"email": ADMIN_EMAIL})
        self.assertRedirect(response)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)
        self.assertTrue(self.user.check_password(ADMIN_PASSWORD))
        # =======================================================================
        # Test accont modification not allowed.
        # =======================================================================
        self.login_test_user()
        data = {"email": TEST_USER}
        response = self.request(self.url, data)
        self.assertEqual(response.status_code, 200)

    def test_reset_password(self):
        self.url = "/account/password/reset/confirm/1-%s" % default_token_generator.make_token(
            self.user)
        self.client.logout()
        response = self.request(self.url, method="GET")
        self.assertEqual(response.status_code, 200)
        data = {"new_password1": "12",
                "new_password2": "other"}
        response = self.request(self.url, data)
        self.assertEqual(response.status_code, 200)
        data["new_password2"] = "12"
        response = self.request(self.url, data)
        self.assertRedirectToComplete(response)
        self.assertTrue(self.user.check_password("12"))
