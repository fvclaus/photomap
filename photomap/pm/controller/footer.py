'''
Created on Feb 10, 2013

@author: fredo
'''

from django.shortcuts import render_to_response, redirect
from pm.form.footer import ContactForm
from pm.mail import send_mail
from django.http import HttpResponseBadRequest
from django.template import RequestContext

def contact(request):
    if request.method == "GET":
        return render_to_response("footer/contact.html", {"form" : ContactForm()}, context_instance = RequestContext(request))
    else:
        form = ContactForm(request.POST, auto_id = True)
        if form.is_valid():
            try:
                message = format_message(form.cleaned_data["email"],
                                         form.cleaned_data["message"])
                # This almost never fails.
                send_mail(form.cleaned_data["subject"],
                          message)
                return redirect("/contact/success") 
            except Exception, e:
                form.errors["__all__"] = form.error_class([str(e)])
                return render_to_response("footer/contact.html", {"form": form}, context_instance = RequestContext(request))
                
        else:
            return render_to_response("footer/contact.html", {"form": form}, context_instance = RequestContext(request))
        
def format_message(from_email, message):
    return "From %s:\n%s" % (from_email, message)

def contact_success(request):
    if request.method == "GET":
        return render_to_response("footer/contact-success.html", context_instance = RequestContext(request))
    else:
        return HttpResponseBadRequest()
        
        
