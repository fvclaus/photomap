'''
Created on Jun 19, 2013

@author: Marc
'''
from django import forms

class UserUpdatePasswordForm(forms.Form):
    old_password = forms.CharField(widget = forms.PasswordInput)
    new_password = forms.CharField(widget = forms.PasswordInput)
    new_password_repeat = forms.CharField(widget = forms.PasswordInput)
        
class UserUpdateEmailForm(forms.Form):
    new_email = forms.EmailField()
    confirm_password = forms.CharField(widget = forms.PasswordInput)
        
class UserDeleteAccountForm(forms.Form):
    user_email = forms.EmailField()
    user_password = forms.CharField(widget = forms.PasswordInput)
    

class UserForgotPasswordForm(forms.Form):
    email = forms.EmailField()