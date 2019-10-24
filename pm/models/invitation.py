from django.contrib.auth.models import User
from django.db import models

from .album import Album


class Invitation(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
