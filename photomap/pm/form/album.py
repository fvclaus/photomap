'''
Created on 22.07.2012

@author: Frederik Claus
'''
from django import forms
from pm.model.album import Album

class AlbumInsertForm(forms.ModelForm):
    class Meta:
        model = Album
        exclude = ("country", "user", "date", "secret", "password")
        
class AlbumUpdateForm(forms.ModelForm):
    class Meta:
        model = Album
        exclude = ("country", "user", "lat", "lon", "date", "secret", "password")
        
class AlbumPasswordUpdateForm(forms.Form):
    password = forms.CharField()
    

class AlbumShareLoginForm(forms.Form):
    password = forms.CharField()
    

    
