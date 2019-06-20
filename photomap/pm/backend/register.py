'''
Created on Aug 29, 2013

@author: fredo
'''


from pm.form.registration import RegistrationForm
from registration.backends.default import DefaultBackend
from registration.signals import user_registered


class RegistrationBackend(DefaultBackend):

    def get_form_class(self, request):
        return RegistrationForm

    def register(self, request, **kwargs):
        super(RegistrationBackend, self).register(request,
                                                  username = kwargs["username"],
                                                  email = kwargs["username"] ,
                                                  password1 = kwargs["password1"])

def save_extra_attributes(sender, user, request, **kwargs):
    user.first_name = request.POST.get("first_name", default = "")
    user.last_name = request.POST.get("last_name", default = "")
    user.save()

user_registered.connect(save_extra_attributes)
