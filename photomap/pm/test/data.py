'''
Created on Jul 3, 2012

@author: fredo
'''

import os
from django.conf import settings
from decimal import Decimal

# ===============================================================================
# Admin credentials
# ===============================================================================
ADMIN_USER = "admin@keiken.de"
ADMIN_PASSWORD = "admin"
ADMIN_EMAIL = "admin@keiken.de"

# ===============================================================================
# Test user credentials
# ===============================================================================
TEST_USER = "test@keiken.de"
TEST_PASSWORD = "test"


TEST_PHOTO = os.path.join(settings.TEST_PATH, "test.jpeg")
TEST_PHOTO_WATER = os.path.join(settings.TEST_PATH, "water.jpeg")
TEST_PHOTO_MOUNTAIN = os.path.join(settings.TEST_PATH, "mountain.jpeg")

QUANTIZE_EXPONENT = Decimal("0.0000001")

GPS_MANNHEIM_SCHLOSS = {"lat":Decimal(48.01230012).quantize(QUANTIZE_EXPONENT),
                        "lon":Decimal(8.0123123).quantize(QUANTIZE_EXPONENT)}

ACTIVATION_KEY = "f7737a8b5f8ec344b938a2ce8a3a5a0efd54c4cf"
