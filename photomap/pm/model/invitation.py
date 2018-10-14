from django.contrib.auth.models import User
from django.db import models
from .album import Album
from pm import appsettings


class Invitation(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        app_label = appsettings.APP_NAME
