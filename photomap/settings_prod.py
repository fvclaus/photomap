'''
Created on Jul 29, 2012

@author: fredo
'''


from settings import *

DEBUG = False
TEMPLATE_DEBUG = False
COMPRESS_ENABLED = True

#===============================================================================
# exclude admin application
#===============================================================================
#temp_app = tuple()
#
#for app in INSTALLED_APPS:
#    if not app == "django.contrib.admin":
#        temp_app += (app,)
#
#INSTALLED_APPS = temp_app

