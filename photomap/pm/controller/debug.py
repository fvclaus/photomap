'''
Created on Feb 2, 2013

@author: fredo
'''

from django.shortcuts import render_to_response
import os


def view(request, name):
    return render_to_response(os.path.join("debug","%s.html" % name), {"name": name })

def test(request, name):
    return render_to_response(os.path.join("debug", "test.html"), {"name" : name })
