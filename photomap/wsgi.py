import os
import sys
import logging
from django.core.wsgi import get_wsgi_application

# add the current directory to the python path
project_path = os.path.abspath(os.path.split(__file__)[0])
if project_path not in sys.path:
    sys.path.append(project_path)


logging.basicConfig(stream=sys.stderr, level=logging.INFO)

logger = logging.getLogger(__name__)
logger.debug("Current path: %s, Project path %s" % (os.getcwd(), project_path))


application = get_wsgi_application()
