'''
Created on Feb 10, 2013

@author: Frederik Claus
'''

from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.core.mail import mail_managers
from django.utils.translation import ugettext as _

from pm.form.footer import ContactForm
from pm.views import ENCODED_MAIL_ADDRESS

def contact(request):
    form = ContactForm()

    if request.method == "POST":
        form = ContactForm(request.POST, auto_id = True)
        if form.is_valid():
            try:
                message = format_message(form.cleaned_data["name"],
                                         form.cleaned_data["email"],
                                         form.cleaned_data["message"])
                # This almost never fails.
                mail_managers("%s: %s" % ("Contact", form.cleaned_data["subject"]),
                          message)
                return redirect("/contact/complete/")
            except Exception as e:
                form.errors["__all__"] = form.error_class([_("MAIL_ERROR")])

    return render_to_response("footer/contact.html", {"form": form, "email_address":  ENCODED_MAIL_ADDRESS}, context_instance = RequestContext(request))

def format_message(name, from_email, message):
    return "From %s<%s>:\nMessage: %s" % (name, from_email, message)
