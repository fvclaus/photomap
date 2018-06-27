from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.http import HttpResponse

from google.appengine.api import mail

import logging

logger = logging.getLogger(__name__)


# Simulating incoming messages with the local development server:
# http://localhost:8000/mail
def receive_incoming_mail(request, recipient):
    incoming_mail = mail.InboundEmailMessage(request)
    (subject, sender) = (incoming_mail.subject, incoming_mail.sender)
    
    logger.info("Received mail for %s from %s with subject %s" % (recipient, sender, subject))
    # Reply-To header did not work.
    outgoing_mail = EmailMultiAlternatives("%s from %s" % (subject, sender), to=[a[1] for a in settings.ADMINS], from_email=recipient)

    for content_type, body in incoming_mail.bodies():
        logger.info("Received content_type %s, body %s" % (content_type, body.decode()))
        if content_type == "text/plain":
            outgoing_mail.body = body
        else:
            outgoing_mail.attach_alternative(content_type, body.decode())

    outgoing_mail.send(fail_silently = False)
            
    return HttpResponse()
    

    
