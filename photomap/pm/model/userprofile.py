'''
Created on Jun 22, 2012

@author: fredo
'''

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from pm import appsettings

# hack to make username not unique
User._meta.get_field('username')._unique = False

class UserProfile(models.Model):
    """
    @author: Frederik Claus
    @summary: adds a picture field to the user model
    """
    user = models.OneToOneField(User)
    picture = models.ImageField(upload_to=settings.PROFILE_PICTURE_PATH,blank = True, null = True)
    quota = models.IntegerField(default = 367001600) #350 mbyte
    used_space = models.IntegerField(default = 0)
    
    class Meta:
        app_label = appsettings.APP_NAME
            
    def getpictureurl(self):
        """
        @author: Frederik Claus
        @summary: Returns a relative url to the profile picture of this user. Uses the default profile picture from settings.DEFAULT_PROFILE_PICTURE_PATH if none is set.
        """ 
        return None
    
    def __unicode__(self):
        return "%s" % (self.user)
    
def create_user_profile(sender, instance, created, **kwargs):
    """
    @author: Frederik Claus
    @summary: Adds the additional fields to a new user on creation
    """
    if kwargs['raw']:
        import logging
        logger = logging.getLogger(__name__)
        logger.debug("Skipping creating of userprofile. This is a raw query.")
    elif created:
        import logging
        logger = logging.getLogger(__name__)
        logger.debug("Creating userprofile")
        UserProfile.objects.create(user=instance)


post_save.connect(create_user_profile, sender=User)


