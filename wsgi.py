import logging
import sys

from django.core.wsgi import get_wsgi_application

logging.basicConfig(stream=sys.stderr, level=logging.INFO)

logger = logging.getLogger(__name__)

application = get_wsgi_application()
