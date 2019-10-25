from django.contrib.auth import hashers


def create_user(apps, email, password, first_name, last_name):
    User = apps.get_model('pm', 'User')
    user = User(email=email,
                first_name=first_name, last_name=last_name)
    user.password = hashers.make_password(password)
    user.save()

    UserProfile = apps.get_model('pm', 'UserProfile')
    user_profile = UserProfile(user=user)
    user_profile.save()

    return user
