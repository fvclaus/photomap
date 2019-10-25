from django.contrib import admin

from .album import Album
from .description import Description  # noqa
from .photo import Photo
from .place import Place
from .user import User
from .userprofile import UserProfile

admin.site.register(Album)
admin.site.register(Photo)
admin.site.register(Place)
admin.site.register(UserProfile)
admin.site.register(User)
