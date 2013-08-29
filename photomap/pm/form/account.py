'''
Created on Jun 19, 2013

@author: Marc
'''
from django.utils.translation import ugettext as _
from django import forms
from django.core.exceptions import ValidationError




class UpdatePasswordForm(forms.Form):
    old_password = forms.CharField(widget = forms.PasswordInput)
    new_password = forms.CharField(widget = forms.PasswordInput)
    new_password_repeat = forms.CharField(widget = forms.PasswordInput)

    def clean(self):
        new_password = self.cleaned_data.get("new_password")
        new_password_repeat = self.cleaned_data.get("new_password_repeat")
        if new_password != new_password_repeat:
            raise ValidationError(_("PASSWORD_REPETITION_WRONG"), code = "invalid")
        return self.cleaned_data
        
        
class UpdateEmailForm(forms.Form):
    new_email = forms.EmailField()
    confirm_password = forms.CharField(widget = forms.PasswordInput)
        
class DeleteAccountForm(forms.Form):
    user_email = forms.EmailField()
    user_password = forms.CharField(widget = forms.PasswordInput)
    
class DeleteAccountReasonsForm(forms.Form):
    cause = forms.RadioSelect()
    cause_message = forms.Textarea()
    optional_message = forms.Textarea()
