'''
Created on Jul 10, 2012

@author: fredo
'''

from django.shortcuts import render_to_response

def show(request):
    if request.method == "GET":
        render_to_response("")
        
