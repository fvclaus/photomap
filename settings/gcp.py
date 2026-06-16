"""
Production settings for GCP Cloud Run deployment.

DATABASE_URL env var is injected by Cloud Run from the 'db-connection-production' secret.
Photos are stored in GCS (GCS_BUCKET_NAME env var).
"""

import os
import urllib.parse

from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = ["*"]

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", SECRET_KEY)

# Parse PostgreSQL connection string from DATABASE_URL.
_db_url = urllib.parse.urlparse(os.environ.get("DATABASE_URL", ""))
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": _db_url.path.lstrip("/"),
        "USER": _db_url.username,
        "PASSWORD": _db_url.password,
        "HOST": _db_url.hostname,
        "PORT": _db_url.port or 5432,
        "CONN_MAX_AGE": 600,
    }
}

STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"
STATIC_ROOT = os.path.join(PROJECT_PATH, "staticfiles")

# Expose only the Dojo AMD packages from node_modules so collectstatic
# puts them at /static/dojo/, /static/dijit/, /static/dojox/.
_nm = os.path.join(PROJECT_PATH, "node_modules")
STATICFILES_DIRS = list(STATICFILES_DIRS) + [
    ("dojo", os.path.join(_nm, "dojo")),
    ("dijit", os.path.join(_nm, "dijit")),
    ("dojox", os.path.join(_nm, "dojox")),
]

# Offline compression — CSS/JS built during Docker image build.
COMPRESS_OFFLINE = True
COMPRESS_ROOT = STATIC_ROOT

MIDDLEWARE = list(MIDDLEWARE)
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

# Cloud Run terminates TLS upstream.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

GCS_BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "photomap-photos")
