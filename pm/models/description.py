from django.db import models


class Description(models.Model):
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
