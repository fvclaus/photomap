import os

from google.cloud import firestore as gcp_firestore
from google.cloud import storage as gcs

_db = None
_gcs_client = None


def get_db():
    global _db
    if _db is None:
        emulator_host = os.environ.get("FIRESTORE_EMULATOR_HOST")
        project = os.environ.get("GCLOUD_PROJECT", os.environ.get("GCP_PROJECT_ID", "photomap-499617"))
        if emulator_host:
            # Emulator mode: no real credentials needed. The SDK reads
            # FIRESTORE_EMULATOR_HOST automatically to route gRPC calls.
            from google.auth.credentials import AnonymousCredentials
            _db = gcp_firestore.Client(project=project, credentials=AnonymousCredentials())
        else:
            # Production: use Application Default Credentials.
            _db = gcp_firestore.Client(project=project)
    return _db


def get_gcs_client():
    global _gcs_client
    if _gcs_client is None:
        _gcs_client = gcs.Client()
    return _gcs_client


def get_gcs_bucket():
    from django.conf import settings
    return get_gcs_client().bucket(settings.GCS_BUCKET_NAME)


def reset():
    """Reset cached clients (useful between tests when switching emulator state)."""
    global _db, _gcs_client
    _db = None
    _gcs_client = None
