"""
Google Cloud Storage helpers for photo upload/retrieval.
Photos are stored under gs://{bucket}/photos/{uuid}/original.jpg
Thumbnails at      gs://{bucket}/photos/{uuid}/thumb.jpg
"""

import logging

from .client import get_gcs_bucket

logger = logging.getLogger(__name__)

SIGNED_URL_EXPIRY_SECONDS = 3600


def upload_photo(photo_uuid, original_bytes, thumb_bytes, content_type="image/jpeg"):
    """Upload original and thumbnail to GCS. Returns (photo_url, thumb_url) as signed URLs."""
    bucket = get_gcs_bucket()

    original_blob = bucket.blob(f"photos/{photo_uuid}/original.jpg")
    original_blob.upload_from_string(original_bytes, content_type=content_type)

    thumb_blob = bucket.blob(f"photos/{photo_uuid}/thumb.jpg")
    thumb_blob.upload_from_string(thumb_bytes, content_type=content_type)

    photo_url = original_blob.generate_signed_url(expiration=SIGNED_URL_EXPIRY_SECONDS)
    thumb_url = thumb_blob.generate_signed_url(expiration=SIGNED_URL_EXPIRY_SECONDS)

    logger.info("Uploaded photo %s to GCS", photo_uuid)
    return photo_url, thumb_url


def delete_photo(photo_uuid):
    """Delete both original and thumbnail from GCS."""
    bucket = get_gcs_bucket()
    for suffix in ["original.jpg", "thumb.jpg"]:
        blob = bucket.blob(f"photos/{photo_uuid}/{suffix}")
        if blob.exists():
            blob.delete()
    logger.info("Deleted photo %s from GCS", photo_uuid)


def get_photo_bytes(photo_uuid, thumb=False):
    """Download raw bytes for a photo or thumbnail from GCS."""
    bucket = get_gcs_bucket()
    suffix = "thumb.jpg" if thumb else "original.jpg"
    blob = bucket.blob(f"photos/{photo_uuid}/{suffix}")
    return blob.download_as_bytes()
