import django_heroku
from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

django_heroku.settings(locals())
