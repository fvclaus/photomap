'''
Created on Aug 28, 2012

@author: fredo
'''

import boto
from boto.s3.acl import CannedACLStrings
import settings

S3_URL = "https://s3-eu-west-1.amazonaws.com"
BUCKET_NAME = "photomap"

def getbucket():
    s3 = boto.connect_s3(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)
    bucket = s3.get_bucket(BUCKET_NAME)
    return bucket

def build_url(key):
    return "%s/%s/%s" % (S3_URL, BUCKET_NAME, key)

def delete_key(key):
    bucket = getbucket()
    if bucket.get_key(key):
        bucket.delete_key(key)
