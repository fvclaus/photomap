from django import forms

from pm.models.place import Place


class InsertPlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        exclude = ("date", )


class UpdatePlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        exclude = ("album", "lat", "lon", "date")
