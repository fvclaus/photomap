from settings import configure_whitenoise
from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG
COMPRESS_OFFLINE = True

configure_whitenoise(locals())

ALLOWED_HOSTS = ["localhost"]
