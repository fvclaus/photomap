'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from pm import appsettings

class Description(models.Model):
    # might be a little excessive
    title = models.TextField()
    description = models.TextField(blank = True, null = True)
    date = models.DateTimeField(auto_now_add = True)
    
    class Meta:
        app_label = appsettings.APP_NAME
        abstract = True
