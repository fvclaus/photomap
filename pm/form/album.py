'''
Created on 22.07.2012

@author: Frederik Claus
'''
from django import forms
from pm.models.album import Album


class AlbumInsertForm(forms.ModelForm):
    class Meta:
        model = Album
        exclude = ("user", "date", "secret", "password")


class AlbumUpdateForm(forms.ModelForm):
    class Meta:
        model = Album
        exclude = ("user", "lat", "lon",
                   "date", "secret", "password")


class AlbumPasswordUpdateForm(forms.Form):
    password = forms.CharField()


class AlbumShareLoginForm(forms.Form):
    password = forms.CharField()
