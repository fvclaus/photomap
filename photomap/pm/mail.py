from django.core.mail.backends.base import BaseEmailBackend
from google.appengine.api import mail

import os

import logging


logger = logging.getLogger(__name__)

# https://cloud.google.com/appengine/docs/standard/python/mail/sending-mail-with-mail-api
class GaeEmailBackend(BaseEmailBackend):

    def send_messages(self, email_messages):
        if not email_messages:
            return
        num_sent = 0
        for message in email_messages:
            logger.info("Sending mail %s to %s" % (message.subject, message.to))
            try:
                # TODO sender is not passed through send_mail correctly.
                mail.send_mail(sender=os.environ["EMAIL_FROM"],
                               to=message.to,
                               subject=message.subject,
                               body=message.body)
                num_sent += 1
            except:
                pass
        return num_sent
