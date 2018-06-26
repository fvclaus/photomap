from django.conf import settings
import os

try:
    from pm.util.google_cloud_storage import delete_from_gc_storage as delete_file
except ImportError:
    def delete_file(f):
        os.remove(f.path)

