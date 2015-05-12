'''
Created on Aug 28, 2012

@author: fredo
'''

import boto
from boto.s3.acl import CannedACLStrings
import settings
import os
import logging

logger = logging.getLogger(__name__)


try:
    import environment
except ImportError:
    raise EnvironmentError("Cannot load python module environment. Please copy environment-sample and provide values for all keys.")

import environment


def getbucket():    
    s3 = boto.connect_s3(environment.AWS_ACCESS_KEY, environment.AWS_SECRET_ACCESS_KEY)
    bucket = s3.get_bucket(environment.BUCKET_NAME)
    return bucket

def build_url(key):
    return "%s/%s/%s" % (environment.S3_URL, environment.BUCKET_NAME, key)

def delete_key(key):
    bucket = getbucket()
    if bucket.get_key(key):
        bucket.delete_key(key)
