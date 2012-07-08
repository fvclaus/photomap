'''
Created on Jul 3, 2012

@author: fredo
'''

from django import forms
from map.model.place import Place

class InsertPlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        
class UpdatePlaceForm(forms.ModelForm):
    id = forms.IntegerField()
    class Meta:
        model = Place
        exclude = ("album", "lat", "lon")
