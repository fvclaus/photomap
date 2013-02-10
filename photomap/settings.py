# Django settings for geotag project.
import os

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
STATIC_PATH = os.path.join(PROJECT_PATH, "static")

UPLOAD_PATH = os.path.join("upload", "%Y", "%m", "%d")
PHOTO_PATH = os.path.join(STATIC_PATH, "photo")
PROFILE_PICTURE_PATH = os.path.join(STATIC_PATH, "profile-picture")
IMAGES_PATH = os.path.join(STATIC_PATH, "images")
DEFAULT_PROFILE_PICTURE = os.path.join(IMAGES_PATH, "default-profile-picture.png")
RES_PATH = os.path.join(PROJECT_PATH, "res")
TEST_PATH = os.path.join(RES_PATH, "test")

CSS_PATH = os.path.join(STATIC_PATH, "css")

LOG_PATH = os.path.join(PROJECT_PATH, "main.log")
LATEX_PATH = os.path.join(RES_PATH, "latex")
DEBUG_PATH = os.path.join(RES_PATH, "debug") 
MANAGERS = ADMINS

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'null': {
            'level':'DEBUG',
            'class':'django.utils.log.NullHandler',
        },
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        }
    },
    'loggers': {
        'django': {
            'handlers':['null'],
            'propagate': True,
            'level':'INFO',
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.db.backends':{
            'handlers': ['console'],
            'level' : 'ERROR',
            'propagate': False,
        },
        'pm': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        }
    }
}

import sys
if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(PROJECT_PATH, "test_db.sqlite"),
            'USER'       : '',
            'PASSWORD' : '',
            'HOST'     : '',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',  # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
            'NAME': 'photomap',  # Or path to database file if using sqlite3.
            'USER': 'django',  # Not used with sqlite3.
            'PASSWORD': 'django',  # Not used with sqlite3.
            'HOST': 'localhost',  # Set to empty string for localhost. Not used with sqlite3.
            'PORT': '5432',  # Set to empty string for default. Not used with sqlite3.
        }
    }

AWS_ACCESS_KEY_ID = "AKIAIC6WYCFDZIOOIWZA"
AWS_SECRET_ACCESS_KEY = "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"
# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Berlin'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'de-de'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = False

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = STATIC_PATH

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# URL prefix for admin static files -- CSS, JavaScript and images.
# Make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/".
ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files
STATICFILES_DIRS = (
                    os.path.join(PROJECT_PATH, 'static'),
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
    "compressor.finders.CompressorFinder",
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '_aoynhp*s8vn0=fgom9%(p^dl^r!gs7ltw7qs%^zu#^*=kcr6)'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
                               'django.contrib.auth.context_processors.auth',
                               'django.core.context_processors.i18n',
                               )

# stylus will not be called from the stylesheets directory, that's why it is necessary to add an absolute path to it
COMPRESS_PRECOMPILERS = (
                         ("text/x-stylus", "stylus < {infile} > {outfile} --include " + CSS_PATH),
                         )

# COMPRESS_ROOT = "static/"
COMPRESS_URL = "/static/"

MIDDLEWARE_CLASSES = (
    'pm.middleware.NoSupportMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    
#    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

AUTHENTICATION_BACKENDS = (
    "pm.controller.authentication.EmailBackend",
    "django.contrib.auth.backends.ModelBackend",
)

# TODO: this does not work
AUTH_PROFILE_MODULE = 'pm.Userprofile'

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'templates'),
)

# uses django compressor http://django_compressor.readthedocs.org/en/latest/settings/
# pip install django_compressor
INSTALLED_APPS = (
    "compressor",
    "pm",
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
     'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)



AUTH_PROFILE_MODULE = "map.model.userprofile.UserProfile"
LOGIN_URL = "/login"

EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_HOST_USER = "team.keiken@gmail.com"
EMAIL_HOST_PASSWORD = "lichtapothekepferdbrot"
EMAIL_USE_TLS = True
