"""
Production settings for GCP deployment.

Uses Firebase Authentication (no relational DB for users),
Firestore for all app data (albums, places, photos metadata),
and Google Cloud Storage for photo binaries.
"""

import os

from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG
COMPRESS_OFFLINE = True

ALLOWED_HOSTS = [os.environ.get("APP_HOST", "localhost")]

# No relational database — all data lives in Firestore.
# Django sessions use signed cookies so no DB is needed.
DATABASES = {}

SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"

# Remove apps that require a relational database.
INSTALLED_APPS = [app for app in INSTALLED_APPS if app not in (
    "django.contrib.admin",
    "django.contrib.sites",
)]

# Replace Django's DB-based auth middleware with Firebase middleware.
MIDDLEWARE = [m for m in MIDDLEWARE if m not in (
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
)]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "pm.firestore.auth.FirebaseAuthMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Authentication backends — Firebase handles auth, no DB backend needed.
AUTHENTICATION_BACKENDS = []

# GCS bucket for photo storage.
GCS_BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "photomap-photos")

# Firebase / GCP project.
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "photomap-499617")

# Static files served by WhiteNoise.
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
STATIC_ROOT = os.path.join(PROJECT_PATH, "staticfiles")

# Security settings for production.
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
