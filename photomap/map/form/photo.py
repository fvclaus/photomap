'''
Created on Jul 3, 2012

@author: fredo
'''

from django import forms
from map.model.photo import Photo

class PhotoInsertForm(forms.ModelForm):
    class Meta:
        model = Photo
#        exclude = ("thumb",)
        
class PhotoUpdateForm(forms.ModelForm):
    class Meta:
        model = Photo
        exclude = ("photo",)
