'''
Created on Jul 29, 2012

@author: fredo
'''

#===============================================================================
# IMPORTANT
#===============================================================================
"""
use django-admin.py COMMAND --settings=settings_prod --insecure instead of anything else
--insecure enables static file serving
"""

from settings import *
import os
import logging

logger = logging.getLogger(__name__)
WARNING = '\033[93m'
ENDC = '\033[0m'


DEBUG = False
TEMPLATE_DEBUG = False
COMPRESS_ENABLED = True

# not NOT_ is a little confusing
if not os.environ.has_key("DJANGO_NO_COMPRESS_OFFLINE") or os.environ["DJANGO_NO_COMPRESS_OFFLINE"] == "false":
    print WARNING + "You are using offline compressed files. Changes will not be reflected until you execute python manage.py compress" + ENDC
    COMPRESS_OFFLINE = True


COMPRESS_JS_FILTERS = ["compressor.filters.closure.ClosureCompilerFilter"]
COMPRESS_CLOSURE_COMPILER_BINARY = "java -jar " + os.path.join(PROJECT_PATH, "lib", "compiler.jar")
COMPRESS_CLOSURE_COMPILER_ARGUMENTS = "--warning_level DEFAULT --compilation_level SIMPLE_OPTIMIZATIONS --language_in=ECMASCRIPT5"


EMAIL_BACKEND = 'pm.mail.GaeEmailBackend'

IS_GAE = True

temp_app = tuple()

for app in INSTALLED_APPS:
    if not app == "django.contrib.admin":
        temp_app += (app,)

INSTALLED_APPS = temp_app

if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine'):
    # Running on production App Engine, so connect to Google Cloud SQL using
    # the unix socket at /cloudsql/<your-cloudsql-connection string>
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'HOST': '/cloudsql/keiken-208312:europe-west3:keikensql',
            'NAME': 'photomap',
            'USER': 'photomap',
            'PASSWORD': 'OQDsy5IYf1CdzDpsaiLQ',
        }
    }

