'''
Created on Aug 28, 2013

@author: Frederik Claus
'''

from django.core.mail import send_mail as send_mail_django
from django.conf import settings

def send_mail(subject, message):
    send_mail_django(subject,
                     message,
                     settings.EMAIL_HOST_USER,
                     [settings.EMAIL_HOST_USER],
                      fail_silently = False)
