'''
Created on Jul 3, 2012

@author: fredo
'''

from django import forms
from pm.model.photo import Photo

class PhotoInsertForm(forms.ModelForm):
    class Meta:
        model = Photo
        exclude = ("thumb", "order","date")
        
class PhotoUpdateForm(forms.ModelForm):
    id = forms.IntegerField()
    class Meta:
        model = Photo
        exclude = ("photo", "place" , "thumb","date")
