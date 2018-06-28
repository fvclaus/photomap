import django.views.generic.simple as simple_views
from django.conf import settings

import random
import string



def encode_letter(letter):
    random_padding = [random.choice(string.letters) for _ in range(4)]
    return "".join(random_padding) + letter

def encode_mail_address(mail_address):    
    return "".join(map(lambda letter: encode_letter(letter), mail_address))


ENCODED_MAIL_ADDRESS = encode_mail_address(settings.EMAIL_ADDRESS)


def direct_to_template(request, template, extra_context=None, mimetype=None, **kwargs):
    if extra_context is None:
        extra_context = {}
    extra_context["email_address"] = ENCODED_MAIL_ADDRESS
    return simple_views.direct_to_template(request, template, extra_context, mimetype, **kwargs)
    



