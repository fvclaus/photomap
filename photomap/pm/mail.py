from django.core.mail.backends.base import BaseEmailBackend
from google.appengine.api import mail

import environment

import logging


logger = logging.getLogger(__name__)

class GaeEmailBackend(BaseEmailBackend):

    def send_messages(self, email_messages):
        if not email_messages:
            return
        num_sent = 0
        for message in email_messages:
            try:
                # TODO sender is not passed through send_mail correctly.
                mail.send_mail(sender=environment.EMAIL_FROM,
                               to=message.to,
                               subject=message.subject,
                               body=message.body)
                num_sent += 1
            except:
                pass
        return num_sent
