import django_registration.backends.activation.views as views

from pm.form.registration import RegistrationForm


class RegistrationView(views.RegistrationView):
    def get_form_class(self):
        return RegistrationForm
