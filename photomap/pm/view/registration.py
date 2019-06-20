import django_registration.backends.activation.views as views

from pm.form.registration import RegistrationForm


class RegistrationView(views.RegistrationView):
    def get_form_class(self):
        return RegistrationForm

    # def register(self, form):
    #     super(RegistrationBackend, self).register(request,
    #                                               username=kwargs["username"],
    #                                               email=kwargs["username"],
    #                                               password1=kwargs["password1"])


class ActivationView(views.ActivationView):
    pass
