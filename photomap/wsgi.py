import os
import sys
import logging
import django.core.handlers.wsgi

# add the current directory to the python path
project_path = os.path.abspath(os.path.split(__file__)[0])
if project_path not in sys.path:
    sys.path.append(project_path)


logging.basicConfig(stream=sys.stderr, level=logging.INFO)

logger = logging.getLogger(__name__)
logger.debug("Current path: %s, Project path %s" % (os.getcwd(), project_path))


application = django.core.handlers.wsgi.WSGIHandler()


# def application(req_environ, start_response):
#     settings_module = 'settings_frontend'
#     logger.debug(req_environ.keys())

#     if req_environ.has_key('VIDEOTAGGING_SETTINGS_MODULE'):
#         settings_module = req_environ['VIDEOTAGGING_SETTINGS_MODULE']
#         logger.info("VIDEOTAGGING_SETTINGS_MODULE: %s set in current environment." % settings_module)
#     else:
#         logger.info("VIDEOTAGGING_SETTINGS_MODULE not set in current environment, using '%s' instead." % settings_module)

#     settings_module_path = os.path.join(project_path, "%s.py" % settings_module)

#     if not os.path.isfile(settings_module_path):
#         raise RuntimeError, "VIDEOTAGGING_SETTINGS_MODULE %s is not a file." % settings_module_path
        
#     os.environ['DJANGO_SETTINGS_MODULE'] = settings_module
#     application = django.core.handlers.wsgi.WSGIHandler()
#     return application(req_environ, start_response)

