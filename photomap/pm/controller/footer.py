'''
Created on Feb 10, 2013

@author: fredo
'''

from django.shortcuts import render_to_response,redirect
from pm.form.footer import ContactForm
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponseBadRequest

def contact(request):
    if request.method == "GET":
        return render_to_response("contact.html", {"form" : ContactForm()})
    else:
        form = ContactForm(request.POST, auto_id = True)
        if form.is_valid():
            try:
                message = format_message(form.cleaned_data["email"],
                                         form.cleaned_data["message"])
                
                send_mail(form.cleaned_data["subject"],
                          message,
                          settings.EMAIL_HOST_USER,
                          [settings.EMAIL_HOST_USER]
                          )
                return redirect("/contact-success") 
            except Exception, e:
                return render_to_response("contact.html", {"form": form, "mail-error": str(e)})
                
        else:
            return render_to_response("contact.html", {"form": form})
        
def format_message(from_email, message):
    return "%s\n%s" % (from_email, message)

def contact_success(request):
    if request.method == "GET":
        return render_to_response("contact-success.html")
    else:
        return HttpResponseBadRequest()
        
        