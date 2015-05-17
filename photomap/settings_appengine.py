import logging 
import os

logger = logging.getLogger(__name__)
WARNING = '\033[93m'
ENDC = '\033[0m'

try:
    from google.appengine.api import apiproxy_stub_map
except ImportError:
    from djangoappengine.boot import setup_env
    setup_env()

from djangoappengine.utils import on_production_server, have_appserver
logger.info("Server is runnning on production server? {0}".format(on_production_server))

from settings import *
# Overwrite with appengine specific settings.
# This will also setup the dev_appserver environment.      
from djangoappengine.settings_base import *

# Set overwritten variables again
COMPRESS_OFFLINE = True
logger.warn("You are using offline compressed files. Changes will not be reflected until you execute python manage.py compress")
COMPRESS_JS_FILTERS = ["compressor.filters.closure.ClosureCompilerFilter"]
COMPRESS_ENABLED = True
COMPRESS_OFFLINE_CONTEXT = {
    "STATIC_URL" : '/static/'
    }
COMPRESS_CLOSURE_COMPILER_BINARY = os.path.join(PROJECT_PATH, "lib", "compiler.jar")
COMPRESS_CLOSURE_COMPILER_ARGUMENTS = "--warning_level DEFAULT --compilation_level SIMPLE_OPTIMIZATIONS --language_in=ECMASCRIPT5"

DEBUG = False
TEMPLATE_DEBUG = DEBUG

IS_APPENGINE = True

# Activate django-dbindexer for the default database
DATABASES['native'] = DATABASES['default']
DATABASES['default'] = {'ENGINE': 'dbindexer', 'TARGET': 'native'}
AUTOLOAD_SITECONF = 'pm.appengine.indexes'

temp_app = tuple()

for app in INSTALLED_APPS:
    if not app == "django.contrib.admin":
        temp_app += (app,)

INSTALLED_APPS = temp_app

INSTALLED_APPS = INSTALLED_APPS + (
    'djangotoolbox',
    'autoload',
    'dbindexer',
    # djangoappengine should come last, so it can override a few manage.py commands
    'djangoappengine',
)

MIDDLEWARE_CLASSES = (
    # This loads the index definitions, so it has to come first
    'autoload.middleware.AutoloadMiddleware',
) + MIDDLEWARE_CLASSES

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
)

# This test runner captures stdout and associates tracebacks with their
# corresponding output. Helps a lot with print-debugging.
TEST_RUNNER = 'djangotoolbox.test.CapturingTestSuiteRunner'

ADMIN_MEDIA_PREFIX = '/media/admin/'
TEMPLATE_DIRS = (os.path.join(os.path.dirname(__file__), 'templates'),)

ROOT_URLCONF = 'urls'
