from .apitestcase import ApiTestCase
from .data import ADMIN_EMAIL, ADMIN_PASSWORD


class AuthenticationViewTest(ApiTestCase):

    def test_login_with_next(self):
        self.client.logout()
        # Test template.
        response = self.request("/account/login/", method="GET")
        self.assertEqual(response.status_code, 200)
        data = {"email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "next": "/account/"}
        response = self.request("/account/login/", data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.get("Location"),
                         "http://testserver/account/")
        self.assertEqual(self.client.session.get("_auth_user_id"), 1)

    def test_login_without_next(self):
        self.client.logout()
        data = {"email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "next": ""}
        response = self.request("/account/login/", data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.get("Location"),
                         "http://testserver/dashboard/")

    def test_login_inactive(self):
        self.client.logout()
        data = {"email":  "user2@keiken.de",
                "password": "test"}
        response = self.request("/account/login/", data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.get("Location"),
                         "http://testserver/account/inactive")

    def test_logout(self):
        response = self.request("/account/logout/", method="GET")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.session.get("_auth_user_id"), None)
