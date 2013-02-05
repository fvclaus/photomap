'''
Created on 22.07.2012

@author: MrPhil
'''
from django import forms
from pm.model.album import Album
from pm.model.share import Share

class AlbumInsertForm(forms.ModelForm):
    class Meta:
        model = Album
        exclude = ("country", "user", "date")
        
class AlbumUpdateForm(forms.ModelForm):
    id = forms.IntegerField()
    class Meta:
        model = Album
        exclude = ("country", "user","lat","lon","date")
        
class AlbumPasswordUpdateForm(forms.Form):
    album = forms.IntegerField()
    password = forms.CharField()
    

    
