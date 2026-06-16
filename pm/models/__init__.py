from django.apps import apps

from .album import Album
from .description import Description  # noqa
from .photo import Photo
from .place import Place
from .user import User
from .userprofile import UserProfile

if apps.is_installed("django.contrib.admin"):
    from django.contrib import admin
    admin.site.register(Album)
    admin.site.register(Photo)
    admin.site.register(Place)
    admin.site.register(UserProfile)
    admin.site.register(User)
