'''
Created on Jul 3, 2012

@author: fredo
'''

from django import forms
from map.model.photo import Photo

class Photo(forms.ModelForm):
    class Meta:
        model = Photo
