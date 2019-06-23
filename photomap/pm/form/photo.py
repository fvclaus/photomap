from django import forms

from pm.models.photo import Photo


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
        exclude = ("photo", "order", "place", "thumb", "date", "size")


class MultiplePhotosUpdateForm(forms.ModelForm):
    class Meta:
        model = Photo
        exclude = ("photo", "place", "thumb", "date", "size")
