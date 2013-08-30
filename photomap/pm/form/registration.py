'''
Created on Aug 29, 2013

@author: fredo
'''
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.contrib.auth.models import User

class RegistrationForm(UserCreationForm):
    first_name = forms.CharField(max_length = 50, required = False)
    last_name = forms.CharField(max_length = 50, required = False)
    
    def save(self, commit = True):
        user = super(UserCreationForm, self).save(commit)
        user.email = user.username
        if commit:
            user.save()
        return user
    
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name")
        
