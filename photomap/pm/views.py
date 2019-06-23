import random
import string

from django.conf import settings
from django.views.generic import TemplateView


def encode_letter(letter):
    random_padding = [random.choice(string.ascii_letters) for _ in range(4)]
    return "".join(random_padding) + letter


def encode_mail_address(mail_address):
    return "".join(map(lambda letter: encode_letter(letter), mail_address))


ENCODED_MAIL_ADDRESS = encode_mail_address(settings.EMAIL_ADDRESS)


def direct_to_template(template_name_param):
    class DefaultTemplateView(TemplateView):
        template_name = template_name_param

        def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            context["email_address"] = ENCODED_MAIL_ADDRESS
            context["compress_enabled"] = settings.COMPRESS_ENABLED
            return context

    return DefaultTemplateView.as_view()
