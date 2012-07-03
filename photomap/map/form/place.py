'''
Created on Jul 3, 2012

@author: fredo
'''

from django import forms
from map.model.place import Place

class Place(forms.ModelForm):
    class Meta:
        model = Place
