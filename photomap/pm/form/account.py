from django import forms
from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext as _


class UpdatePasswordForm(forms.Form):
    old_password = forms.CharField(widget=forms.PasswordInput)
    new_password = forms.CharField(widget=forms.PasswordInput)
    new_password_repeat = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        new_password = self.cleaned_data.get("new_password")
        new_password_repeat = self.cleaned_data.get("new_password_repeat")
        if new_password != new_password_repeat:
            raise ValidationError(
                _("PASSWORD_REPETITION_ERROR"), code="invalid")
        return self.cleaned_data


class UpdateEmailForm(forms.Form):
    new_email = forms.EmailField()
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        new_email = self.cleaned_data.get("new_email")
        if len(User.objects.filter(username=new_email)) == 1:
            raise ValidationError(_("EMAIL_ALREADY_EXISTS_ERROR"))
        return self.cleaned_data


class PasswordResetForm(PasswordResetForm):
    def clean_email(self):
        """
        Validates that an active user exists with the given email address.
        """
        email = self.cleaned_data["email"]
        self.users_cache = User.objects.filter(username=email,
                                               is_active=True)
        if not len(self.users_cache):
            raise forms.ValidationError("unknown")
        user = self.users_cache[0]
        if user.username == settings.EMAIL_TEST_USER:
            raise forms.ValidationError(_("REQUEST_NOT_ALLOWED_ERROR"))
        # Tell PasswordResetForm where to send the email to.
        # The user object will not be saved.
        user.email = user.username
#        if any((user.password == UNUSABLE_PASSWORD)
#               for user in self.users_cache):
#            raise forms.ValidationError(self.error_messages['unusable'])
        return email


class DeleteAccountForm(forms.Form):
    user_email = forms.EmailField()
    user_password = forms.CharField(widget=forms.PasswordInput)


class DeleteAccountReasonsForm(forms.Form):
    cause = forms.RadioSelect()
    cause_message = forms.Textarea()
    optional_message = forms.Textarea()
