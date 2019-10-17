from django.db import models
from pm import appsettings


class Description(models.Model):
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = appsettings.APP_NAME
        abstract = True
