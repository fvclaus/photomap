import django_heroku
from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

BASE_DIR = PROJECT_PATH

django_heroku.settings(locals())
