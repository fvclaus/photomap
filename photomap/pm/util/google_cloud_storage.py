'''
Created on Aug 28, 2012

@author: fredo
'''

# API docs for gae cloud storage client: https://cloud.google.com/appengine/docs/standard/python/googlecloudstorageclient/functions
import cloudstorage
import settings
import os
import logging

logger = logging.getLogger(__name__)


try:
    import environment
except ImportError:
    raise EnvironmentError("Cannot load python module environment. Please copy environment-sample and provide values for all keys.")


def build_url(key):
    return "%s/%s/%s" % (environment.GC_STORAGE_URL, environment.GC_STORAGE_BUCKET_NAME, key)

def _create_filename(name):
    return  "/%s/%s" % (environment.GC_STORAGE_BUCKET_NAME, name)

def delete_from_gc_storage(name):
    cloudstorage.delete(_create_filename(name))

def upload_to_gc_storage(f, name):
    options = {'x-goog-acl': 'public-read'}
    with cloudstorage.open(_create_filename(name), 'w', content_type='image/jpeg', options=options) as cloudstorage_file:
        while True:
            data = f.read(100000)
            if data == '':  # end of file reached
                break
            cloudstorage_file.write(data)
