'''
Created on Jul 10, 2012

@author: fredo
'''

from django import forms

class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget = forms.PasswordInput)

class RegisterForm(forms.Form):
    first_name = forms.CharField()
    last_name = forms.CharField()
    email = forms.EmailField()
    password = forms.CharField(widget = forms.PasswordInput)
    confirm = forms.CharField(widget = forms.PasswordInput)