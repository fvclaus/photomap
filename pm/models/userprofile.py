import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save

BYTE_TO_MBYTE = pow(2, 20)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    picture = models.BinaryField(blank=True, null=True)
    quota = models.IntegerField(default=settings.USER_QUOTA)
    used_space = models.IntegerField(default=0)

    def getpictureurl(self):
        return None

    def get_limit(self):
        return "%.1f/%.1f MB" % tuple(map(lambda x: float(x) / BYTE_TO_MBYTE, (self.used_space, self.quota)))

    def _to_mb(self, number):
        return float(number) / BYTE_TO_MBYTE

    @property
    def quota_in_mb(self):
        return self._to_mb(self.quota)

    @property
    def used_space_in_mb(self):
        return self._to_mb(self.used_space)

    @property
    def free_space_in_mb(self):
        return self._to_mb(self.quota - self.used_space)

    def __unicode__(self):
        return "%s" % (self.user)


def create_user_profile(sender, instance, created, **kwargs):
    logger = logging.getLogger(__name__)
    if kwargs['raw']:
        # Skipping creating of userprofile. This is a raw query."
        pass
    elif created:
        logger.debug("Creating userprofile")
        UserProfile.objects.using(kwargs["using"]).create(user=instance)


post_save.connect(create_user_profile, sender=User)
