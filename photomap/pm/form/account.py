from django import forms
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


class DeleteAccountForm(forms.Form):
    user_email = forms.EmailField()
    user_password = forms.CharField(widget=forms.PasswordInput)


class DeleteAccountReasonsForm(forms.Form):
    cause = forms.RadioSelect()
    cause_message = forms.Textarea()
    optional_message = forms.Textarea()
