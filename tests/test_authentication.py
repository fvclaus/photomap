from .apitestcase import (ADMIN_EMAIL, ADMIN_PASSWORD, INACTIVE_USER_EMAIL,
                          INACTIVE_USER_PASSWORD, ApiTestCase)


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
                         "/account/")
        self.assertEqual(self.client.session.get("_auth_user_id"), '98')

    def test_login_without_next(self):
        self.client.logout()
        data = {"email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "next": ""}
        response = self.request("/account/login/", data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.get("Location"),
                         "/dashboard")

    def test_login_inactive(self):
        self.client.logout()
        data = {"email": INACTIVE_USER_EMAIL,
                "password": INACTIVE_USER_PASSWORD}
        response = self.request("/account/login/", data)
        self.assertNoRedirect(response)

    def test_logout(self):
        response = self.request("/account/logout/", method="GET")
        self.assertRedirect(response)
        self.assertEqual(self.client.session.get("_auth_user_id"), None)
