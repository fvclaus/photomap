'''
Created on Feb 2, 2013

@author: fredo
'''

from django.shortcuts import render_to_response
from django.template import RequestContext
import os

def from_template(response, name):
    return render_to_response(os.path.join("views", "%s.html" % name), {"name" : name }, context_instance = RequestContext(response))

