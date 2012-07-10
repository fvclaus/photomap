'''
Created on Jul 10, 2012

@author: fredo
'''

from django.http import HttpResponseRedirect

def view(request):
    if not request.user.is_authenticated():
        return HttpResponseRedirect('/login')
    
