'''
Created on Jun 22, 2012

@author: fredo
'''
from django.contrib import admin
from django.conf import settings
from pm import model

if settings.DEBUG:
    admin.site.register(model.album.Album)
    admin.site.register(model.photo.Photo)
    admin.site.register(model.place.Place)
#    admin.site.register(model.userprofile.UserProfile)
    
    from pm.model.userprofile import UserProfile
    from django.contrib.auth.models import User
    from django.contrib.auth.admin import UserAdmin
    
    class UserProfileInline(admin.StackedInline):
        model = UserProfile
        can_delete = False
        verbose_name_plural = "userprofile"
        
    class UserAdmin(UserAdmin):
        inlines = (UserProfileInline,)
        
    admin.site.unregister(User)
    admin.site.register(User, UserAdmin) 
        

