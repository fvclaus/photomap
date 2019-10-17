import logging
import re

from django.conf import settings
from django.shortcuts import render_to_response

from pm.view import album, authentication, dashboard


class BrowserCompatibilityMiddleware:
    if settings.DEBUG:
        IS_OK = re.compile("(?P<version>}d{1,2})")
    else:
        IS_OK = re.compile("(?P<browser>Firefox|Chrome)/(?P<version>\d{2})")
    MIN_VERSION_FF = 16
    MIN_VERSION_CHROME = 14

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_view(self, request, view_func, view_args, view_kwargs):
        logger = logging.getLogger(__name__)
        # dashboard and album view are only tested with ff & chrome
        if view_func == album.view or view_func == dashboard.view or view_func == authentication.login:
            try:
                user_agent = request.META["HTTP_USER_AGENT"]
            except:
                user_agent = None

            if user_agent is None:
                logger.info("No user agent set. Redirecting...")
                return render_to_response("not-supported.html")

    #        logger.debug("User agent is %s" % user_agent)
            match = self.IS_OK.search(user_agent)

            if not settings.DEBUG:
                if not match:
                    logger.info("Browser is not supported. Redirecting...")
                    return render_to_response("not-supported.html")
                else:
                    version = int(match.group("version"))
                    # browser in lower case
                    browser = match.group("browser").lower()
                    is_compatible = ((browser == "firefox" and version >= self.MIN_VERSION_FF) or
                                     (browser == "chrome" and version >= self.MIN_VERSION_CHROME))

                    if not is_compatible:
                        logger.info("FF or Chrome in version %d. Must be at least %d, %d" % (
                            version, self.MIN_VERSION_FF, self.MIN_VERSION_CHROME))
                        return render_to_response("not-supported.html")

        # everything else should and must work more or less in every browser
        else:
            return None