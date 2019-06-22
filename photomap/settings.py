# Django settings for geotag project.
import os
import sys

DEBUG = True
TEMPLATE_DEBUG = DEBUG

PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
STATIC_PATH = os.path.join(PROJECT_PATH, "static")

UPLOAD_PATH = os.path.join("upload", "%Y", "%m", "%d")
PHOTO_PATH = os.path.join(STATIC_PATH, "photo")
PROFILE_PICTURE_PATH = os.path.join(STATIC_PATH, "profile-picture")
IMAGES_PATH = os.path.join(STATIC_PATH, "images")
DEFAULT_PROFILE_PICTURE = os.path.join(
    IMAGES_PATH, "default-profile-picture.png")
RES_PATH = os.path.join(PROJECT_PATH, "res")
TEST_PATH = os.path.join(RES_PATH, "test")

# this is needed for django to discover the javascript translations
LOCALE_PATHS = (
    os.path.join(PROJECT_PATH, "locale"),
)

CSS_PATH = os.path.join(STATIC_PATH, "css")
STYLES_PATH = os.path.join(STATIC_PATH, "styles")

LOG_PATH = os.path.join(PROJECT_PATH, "main.log")
LATEX_PATH = os.path.join(RES_PATH, "latex")
DEBUG_PATH = os.path.join(RES_PATH, "debug")


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
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'INFO',
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'pm': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        }
    }
}

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


# This is required by GAE
FILE_UPLOAD_HANDLERS = (
    'django.core.files.uploadhandler.MemoryFileUploadHandler',)
# 10 MB, default is 2.5 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10000000

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

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True,
        'DIRS': [os.path.join(PROJECT_PATH, 'templates')],
        'OPTIONS': {
            'context_processors': [
                'django.contrib.auth.context_processors.auth']
        }
    }
]

# stylus will not be called from the stylesheets directory, that's why it is necessary to add an absolute path to it
COMPRESS_PRECOMPILERS = (
    ("text/x-stylus",
     "stylus < {infile} > {outfile} --include " + STYLES_PATH),
)


MIDDLEWARE = (
    'pm.middleware.BrowserCompatibilityMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

AUTHENTICATION_BACKENDS = (
    "pm.view.authentication.EmailBackend",
    "django.contrib.auth.backends.ModelBackend",
)

# TODO: this does not work
AUTH_PROFILE_MODULE = 'pm.Userprofile'

ROOT_URLCONF = 'urls'

# uses django compressor https://django-compressor.readthedocs.io/en/1.2/settings/
INSTALLED_APPS = (
    "compressor",
    "pm",
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

# Use this for the debug variable in template context
INTERNAL_IPS = ("127.0.0.1")

# AUTH_PROFILE_MODULE = "map.model.userprofile.UserProfile"

# ===============================================================================
# Registration configuration
# ===============================================================================
ACCOUNT_ACTIVATION_DAYS = 7
REGISTRATION_OPEN = True

# ===============================================================================
# Mail configuration
# ===============================================================================
LOGIN_REDIRECT_URL = "/dashboard/"
LOGIN_URL = "/account/login/"
LOGOUT_URL = "/account/logout/"

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# EMAIL_HOST = "smtp.gmail.com"
# EMAIL_PORT = 587
# EMAIL_HOST_USER = "f.v.claus@googlemail.com"
# SERVER_EMAIL = EMAIL_HOST_USER
# EMAIL_HOST_PASSWORD = "itlukrtcgbqkqpcp"
# EMAIL_USE_TLS = True


EMAIL_TEST_USER = "test@keiken.de"
EMAIL_FILE_PATH = os.path.join(TEST_PATH, "mail")

EMAIL_ADDRESS = "info@keiken.de"

IS_GAE = False


ADMINS = (('Frederik Claus', 'f.v.claus@googlemail.com'),)

MANAGERS = ADMINS

# TODO Use password validation https://docs.djangoproject.com/en/2.1/releases/1.9/#password-validation
