'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings 

class UserProfile(models.Model):
    # This is the only required field
    user = models.OneToOneField(User)

    # The rest is completely up to you...
    picture = models.ImageField(upload_to=settings.PHOTO_PATH, height_field=25 , width_field=25)
    
    