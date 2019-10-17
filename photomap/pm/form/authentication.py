from django import forms


class LoginForm(forms.Form):
    email = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)


class RegisterForm(forms.Form):
    first_name = forms.CharField(
        widget=forms.TextInput(attrs={"disabled": "disabled"}))
    last_name = forms.CharField(
        widget=forms.TextInput(attrs={"disabled": "disabled"}))
    email = forms.EmailField(widget=forms.TextInput(
        attrs={"disabled": "disabled"}))
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"disabled": "disabled"}))
    confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={"disabled": "disabled"}))

    def clean_sku(self):
        return self.instance.sk
