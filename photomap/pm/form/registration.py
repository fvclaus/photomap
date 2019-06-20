from django import forms
from django.contrib.auth.models import User
from django_registration.forms import UserCreationForm


class RegistrationForm(UserCreationForm):
    first_name = forms.CharField(max_length=50, required=False)
    last_name = forms.CharField(max_length=50, required=False)

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit)
        # Set username is required. Sync it with email.
        # With Django 1.5 it is possible to create a custom user model:
        # https://docs.djangoproject.com/en/2.1/topics/auth/customizing/#auth-custom-user
        # For me, this requires too much code.
        user.email = user.username
        if commit:
            user.save()
        return user

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name")
