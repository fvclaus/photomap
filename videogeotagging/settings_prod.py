'''
Created on Jun 15, 2012

@author: fredo
'''

from settings import *

DEBUG = False
TEMPLATE_DEBUG = False

temp_app = tuple()

for app in INSTALLED_APPS:
    if not app == "django.contrib.admin":
        temp_app += (app,)

INSTALLED_APPS = temp_app

DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
            'NAME': 'photomap_prod', # Or path to database file if using sqlite3.
            'USER': 'photomap', # Not used with sqlite3.
            'PASSWORD': 'Tah7Ve', # Not used with sqlite3.
            'HOST': 'localhost', # Set to empty string for localhost. Not used with sqlite3.
            'PORT': '5432', # Set to empty string for default. Not used with sqlite3.
        }
    }
