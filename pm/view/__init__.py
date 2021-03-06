import datetime
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def set_cookie(response, key, value, days_expire=None):
    if days_expire is None:
        max_age = 365 * 24 * 60 * 60  # one year
    else:
        max_age = days_expire * 24 * 60 * 60
    expires = datetime.datetime.strftime(datetime.datetime.utcnow(
    ) + datetime.timedelta(seconds=max_age), "%a, %d-%b-%Y %H:%M:%S GMT")
    response.set_cookie(key, value, max_age=max_age, expires=expires,
                        domain=settings.SESSION_COOKIE_DOMAIN, secure=settings.SESSION_COOKIE_SECURE or None)


def update_used_space(user, space):
    userprofile = user.userprofile

    if space > 0:
        logger.debug("Adding space %d to userprofile." % space)
    else:
        logger.debug("Removing space %d from userprofile." % space)

    # Make sure space does not drop below 0.
    userprofile.used_space = max(0, userprofile.used_space + space)
    userprofile.save()
    return userprofile.used_space
