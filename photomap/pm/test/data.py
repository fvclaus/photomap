'''
Created on Jul 3, 2012

@author: fredo
'''

import os
from django.conf import settings
from decimal import Decimal

TEST_USER = "admin"
TEST_PASSWORD = "admin"
TEST_PHOTO = os.path.join(settings.TEST_PATH, "test.jpg")

GPS_MANNHEIM_SCHLOSS = {"lat":Decimal(48.01230012),"lon":Decimal(8.0123123)}