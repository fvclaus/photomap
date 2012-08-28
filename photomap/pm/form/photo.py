'''
Created on Jul 3, 2012

@author: fredo
'''

from django import forms
from pm.model.photo import Photo

class PhotoInsertDEBUGForm(forms.ModelForm):
    """
    @author: Frederik Claus
    @summary: Form to insert data before processing
    """
    photo = forms.ImageField()
    class Meta:
        model = Photo
        exclude = ("thumb", "order","date","photo")
        

class PhotoInsertPRODForm(forms.ModelForm):
    """
    @author: Frederik Claus
    @summary: Form to insert data into db after processing
    """
    class Meta:
        model = Photo
        exclude = ("thumb", "order","date")
        
class PhotoUpdateForm(forms.ModelForm):
    id = forms.IntegerField()
    class Meta:
        model = Photo
        exclude = ("photo", "place" , "thumb","date")
