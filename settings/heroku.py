import django_heroku
from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG
COMPRESS_OFFLINE = True

# BASE_DIR is required by django_heroku
BASE_DIR = PROJECT_PATH

django_heroku.settings(locals(), staticfiles=False)
