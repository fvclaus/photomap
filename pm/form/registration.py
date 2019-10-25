from django import forms
from django.utils.translation import gettext as _
from django_registration.forms import UserCreationForm
from pm.models.user import User


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(max_length=30)
    first_name = forms.CharField(max_length=50, required=False)
    last_name = forms.CharField(max_length=50, required=False)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name")
