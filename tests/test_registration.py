from django.contrib.auth.models import User
from django.test.utils import override_settings

from .apitestcase import ApiTestCase
from .data import ACTIVATION_KEY


class RegistrationViewTest(ApiTestCase):

    def test_send_registration_mail(self):
        self.url = "/account/register/"
        self.client.logout()
        data = {"username": "bigblurb@gmail.com",
                "password1": "123456",
                "password2": "123456"}

        username = data["username"]
        response = self.request(self.url, data)
        self.assertRedirectToComplete(response)
        user = User.objects.get(username=username)
        self.assertEqual(user.email, username)
        self.assertTrue(user.check_password(data["password1"]))
        self.assertFalse(user.is_active)
        messages = self.read_and_delete_mails()
        self.assertEqual(len(messages), 1)
        # =======================================================================
        # With first and last name.
        # =======================================================================
        data["username"] = "something@else.com"
        data["first_name"] = "I.Am."
        data["last_name"] = "Alive"
        response = self.request(self.url, data)
        self.assertRedirectToComplete(response)
        user = User.objects.get(username=data["username"])
        self.assertEqual(user.first_name, data["first_name"])
        self.assertEqual(user.last_name, data["last_name"])

    # The creation date of the test account is too far in the past. It won't activate anymore.
    @override_settings(ACCOUNT_ACTIVATION_DAYS=10000)
    def test_complete_activation(self):
        self.client.logout()
        self.request("/account/activate/%s/" % ACTIVATION_KEY)
        user = User.objects.get(username="user2@keiken.de")
        self.assertTrue(user.is_active)

    def test_templates(self):
        # =======================================================================
        # Try the registration form.
        # =======================================================================
        response = self.request("/account/register/", method="GET")
        self.assertEqual(response.status_code, 200)
        # =======================================================================
        # Try non-existing activation key.
        # =======================================================================
        response = self.request(
            "/account/activate/thisdoesnotexist/", method="GET")
        self.assertEqual(response.status_code, 200)
        # =======================================================================
        # Try to activate expired key.
        # =======================================================================
        response = self.request("/account/activate/%s/" % ACTIVATION_KEY)
        user = User.objects.get(username="user2@keiken.de")
        self.assertFalse(user.is_active)
