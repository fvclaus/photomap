import django_heroku
from settings import configure_whitenoise
from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG
COMPRESS_OFFLINE = True

# BASE_DIR is required by django_heroku
BASE_DIR = PROJECT_PATH

configure_whitenoise(locals())


django_heroku.settings(locals(), staticfiles=False)
