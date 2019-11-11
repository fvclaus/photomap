from django import forms
from pm.models.photo import Photo


class PhotoCheckForm(forms.ModelForm):
    photo = forms.ImageField()

    class Meta:
        model = Photo
        exclude = ("order", "date", "photo", "size", "thumb")


class PhotoUpdateForm(forms.ModelForm):
    class Meta:
        model = Photo
        exclude = ("photo", "order", "place", "thumb", "date", "size")


class MultiplePhotosUpdateForm(forms.ModelForm):
    class Meta:
        model = Photo
        exclude = ("photo", "place", "thumb", "date", "size")
