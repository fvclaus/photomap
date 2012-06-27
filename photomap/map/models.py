from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.db import models
from model.album import Album

class Feed(models.Model):
    album = models.ForeignKey(Album,related_name = "albums")
    user = models.ForeignKey(User, related_name ="users")
    
    class Meta:
        pass

class Permission(models.Model):
    album = models.ForeignKey(Album)
    user = models.ForeignKey(User)
    