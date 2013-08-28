'''
Created on Jul 3, 2012

@author: Frederik Claus
'''

from django import forms
from pm.model.photo import Photo

# class PhotoInsertDEBUGForm(forms.ModelForm):
#    """
#    @author: Frederik Claus
#    @summary: Form to insert data before processing
#    """
#    class Meta:
#        model = Photo
#        exclude = ("order", "date", "size", "thumb")

class PhotoCheckForm(forms.ModelForm):
    photo = forms.ImageField()
    class Meta:
        model = Photo
        exclude = ("order", "date", "photo", "size", "thumb")

class PhotoInsertForm(forms.ModelForm):
    """
    @author: Frederik Claus
    @summary: Form to insert data into db after processing
    """
    class Meta:
        model = Photo
        exclude = ("order", "date", "size")


class PhotoUpdateForm(forms.ModelForm):
    class Meta:
        model = Photo
        exclude = ("photo", "place", "thumb", "date", "size")
