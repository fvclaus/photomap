'''
Created on Jul 10, 2012

@author: fredo
'''

from django import forms


class LoginForm(forms.Form):
    email = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)


class RegisterForm(forms.Form):
    first_name = forms.CharField(
        widget=forms.TextInput(attrs={"disabled": "disabled"}))
    last_name = forms.CharField(
        widget=forms.TextInput(attrs={"disabled": "disabled"}))
    email = forms.EmailField(widget=forms.TextInput(
        attrs={"disabled": "disabled"}))
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"disabled": "disabled"}))
    confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={"disabled": "disabled"}))

    def __init__(self, *args, **kwargs):
        super(RegisterForm, self).__init__(*args, **kwargs)
        instance = getattr(self, 'instance', None)
#        for field in instance.fields:
#            print "Looking at %s" % field
#            field.widget.attrs["readonly"] = True

    def clean_sku(self):
        return self.instance.sk
