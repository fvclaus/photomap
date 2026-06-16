import os
import sys

from settings.common import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(PROJECT_PATH, "test_db.sqlite"),
            'USER': '',
            'PASSWORD': '',
            'HOST': '',
        }
    }
    # This is required by mail_managers().
    SERVER_EMAIL = "test@test"
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'HOST': 'localhost',
            'NAME': 'photomap',
            'USER': 'photomap',
            'PASSWORD': 'photomap',
        }
    }

STATICFILES_DIRS = list(STATICFILES_DIRS) + \
    [os.path.join(PROJECT_PATH, "node_modules")]
