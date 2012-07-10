'''
Created on Jul 10, 2012

@author: fredo
'''

from django import forms

class LoginForm(forms.Form):
    user = forms.CharField()
    password = forms.CharField(widget = forms.PasswordInput)
