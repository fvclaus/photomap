'''
Created on Jul 3, 2012

@author: fredo
'''

from django import forms
from pm.model.place import Place

class InsertPlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        exclude = ("date")
        
class UpdatePlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        exclude = ("album", "lat", "lon","date")
