'''
Created on 22.07.2012

@author: MrPhil
'''
from django import forms
from pm.model.album import Album

class AlbumInsertForm(forms.ModelForm):
    class Meta:
        model = Album
        exclude = ("country", "user")
        
class AlbumUpdateForm(forms.ModelForm):
    id = forms.IntegerField()
    class Meta:
        model = Album
        exclude = ("country", "user")
