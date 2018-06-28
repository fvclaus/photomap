from django.conf import settings

import os

import logging

logger = logging.getLogger(__name__)


try:
    from pm.util.google_cloud_storage import delete_from_gc_storage as delete_file
    from pm.util.google_cloud_storage import upload_to_gc_storage as upload_file
    from pm.util.google_cloud_storage import build_url
except ImportError:
    def to_abs_path(name):
        return os.path.join(settings.PHOTO_PATH, name)
    def delete_file(name):
        logger.info("Removing file %s" % (name, ))
        os.remove(to_abs_path(name))
    def build_url(name):
        return "/" + os.path.relpath(to_abs_path(name), settings.PROJECT_PATH)
    def upload_file(f, name):
        logger.info("%s, %s, %s" % (type(f), f, name))
        logger.info("Writing to %s" % (to_abs_path(name), ))
        with open(to_abs_path(name), "wb") as output_file:
            while True:
                data = f.read(100000)
                if data == '':  # end of file reached
                    break
                logger.info("Writing data")
                output_file.write(data)
            output_file.close()
            

