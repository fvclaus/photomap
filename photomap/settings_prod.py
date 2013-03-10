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

DEBUG = False
TEMPLATE_DEBUG = False
COMPRESS_ENABLED = True
COMPRESS_OFFLINE_CONTEXT = {
    "STATIC_URL" : STATIC_URL
    }


# not NOT_ is a little confusing
if not os.environ.has_key("DJANGO_NO_COMPRESS_OFFLINE") or not os.environ["DJANGO_NO_COMPRESS_OFFLINE"]:
    COMPRESS_OFFLINE = True
    COMPRESS_JS_FILTERS = ["compressor.filters.closure.ClosureCompilerFilter"]

COMPRESS_CLOSURE_COMPILER_BINARY = os.path.join(PROJECT_PATH, "lib", "compiler.jar")
COMPRESS_CLOSURE_COMPILER_ARGUMENTS = "--warning_level DEFAULT --compilation_level SIMPLE_OPTIMIZATIONS --language_in=ECMASCRIPT5"



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
        },
        "export": {
                   "ENGINE": "django.db.backends.sqlite3",
                   "NAME": "export.sqlite3"
                   }
    }
