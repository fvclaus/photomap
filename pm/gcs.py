import logging

logger = logging.getLogger(__name__)


def _get_bucket():
    from django.conf import settings
    from google.cloud import storage
    return storage.Client().bucket(settings.GCS_BUCKET_NAME)


def _blob_path(uuid, kind):
    return "photos/%s/%s.jpg" % (uuid, kind)


def upload(uuid, original_bytes, thumb_bytes):
    bucket = _get_bucket()
    bucket.blob(_blob_path(uuid, "original")).upload_from_string(
        original_bytes, content_type="image/jpeg"
    )
    bucket.blob(_blob_path(uuid, "thumb")).upload_from_string(
        thumb_bytes, content_type="image/jpeg"
    )


def download(uuid, kind):
    """Download image bytes from GCS. kind is 'original' or 'thumb'."""
    return _get_bucket().blob(_blob_path(uuid, kind)).download_as_bytes()


def delete(uuid):
    bucket = _get_bucket()
    for kind in ("original", "thumb"):
        try:
            bucket.blob(_blob_path(uuid, kind)).delete()
        except Exception:
            logger.warning("Could not delete GCS object %s", _blob_path(uuid, kind))
