'''
Created on Feb 10, 2013

@author: fredo
'''

from django import forms

class ContactForm(forms.Form):
    name = forms.CharField()
    email = forms.EmailField()
    subject = forms.CharField()
    message = forms.CharField(widget = forms.Textarea)