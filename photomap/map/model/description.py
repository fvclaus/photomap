'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from map import appsettings

class Description(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField(auto_now = True)
    
    class Meta:
        app_label = appsettings.APP_NAME
        abstract = True