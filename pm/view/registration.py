import os

from pm.form.registration import RegistrationForm

if os.environ.get("SKIP_ACTIVATION"):
    import django_registration.backends.one_step.views as _base
else:
    import django_registration.backends.activation.views as _base


class RegistrationView(_base.RegistrationView):
    form_class = RegistrationForm
