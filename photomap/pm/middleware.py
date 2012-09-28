'''
Created on Sep 28, 2012

@author: fredo
'''

import logging
import re
import sys
from django.shortcuts import render_to_response

class NoSupportMiddleware():
    IS_FF = re.compile("Firefox/(?P<version>\d{2})")
    MIN_VERSION = 10
    
    def process_request(self, request):
        logger = logging.getLogger(__name__)
        try:
            user_agent = request.META["HTTP_USER_AGENT"]
        except:
            if 'test' in sys.argv:
                user_agent = "Firefox/15"
            else:
                user_agent = None
                
        logger.debug("User agent is %s" % user_agent)
        match = self.IS_FF.search(user_agent)
    
        if not match:
            logger.debug("Browser is not firefox. Redirecting...")
            return render_to_response("not-supported.html")
        else:
            version = match.group("version")
            
            if  version < self.MIN_VERSION:
                logger.debug("FF in version %d. Must be at least %d" % (version, self.MIN_VERSION))
                return render_to_response("not-supported.html")
            
            return None
        
