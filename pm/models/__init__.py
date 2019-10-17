from django.contrib import admin

from .album import Album
from .description import Description  # noqa
from .feed import Feed
from .invitation import Invitation
from .photo import Photo
from .place import Place
from .userprofile import UserProfile

admin.site.register(Album)
admin.site.register(Feed)
admin.site.register(Invitation)
admin.site.register(Photo)
admin.site.register(Place)
admin.site.register(UserProfile)
