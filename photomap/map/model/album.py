'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from description import Description
from django.contrib.auth.models import User

class Album(Description):
   
    lat = models.DecimalField(decimal_places=26,max_digits=30)
    lon = models.DecimalField(decimal_places=26,max_digits=30)
    user = models.ForeignKey(User)
    
   
    class Meta(Description.Meta):
        pass