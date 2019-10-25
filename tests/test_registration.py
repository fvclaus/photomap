from datetime import datetime

from django.urls import reverse
from pm.models.user import User
from pm.view.registration import RegistrationView

from .apitestcase import INACTIVE_USER_EMAIL, ApiTestCase


def create_activation_key(user):
    view = RegistrationView()
    return view.get_activation_key(user)


class RegistrationViewTest(ApiTestCase):

    def test_send_registration_mail(self):
        self.client.logout()
        username = "bigblurb@gmail.com"
        response = self.request(reverse('registration_register'),
                                {"username": username,
                                 "first_name": "I.Am.",
                                 "last_name": "Alive",
                                 "password1": "123456",
                                 "password2": "123456"})
        self.assertRedirect(response, reverse('django_registration_complete'))
        user = User.objects.get(username=username)
        self.assertEqual(user.email, username)
        self.assertEqual(user.first_name, 'I.Am.')
        self.assertEqual(user.last_name, 'Alive')
        self.assertTrue(user.check_password("123456"))
        self.assertFalse(user.is_active)
        messages = self.read_and_delete_mails()
        activation_key = create_activation_key(user)
        # Only use the part of the activation_key that encodes the username
        self.assertTrue(activation_key.split(':')[0] in messages[0].body)
        self.assertEqual(len(messages), 1)

    def test_complete_activation(self):
        self.client.logout()
        user = User.objects.get(username=INACTIVE_USER_EMAIL)
        user.date_joined = datetime.now()
        user.save()
        response = self.sendGET(reverse('django_registration_activate',
                                        args=[create_activation_key(user)]))
        self.assertRedirect(response, reverse(
            'django_registration_activation_complete'))
        self.assertTrue(User.objects.get(
            username=INACTIVE_USER_EMAIL).is_active)
