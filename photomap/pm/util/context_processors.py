'''
Created on Aug 23, 2012

@author: fredo
'''

def userdata(request):
    if request.user.is_authenticated():
        useremail = request.user.email
    else:
        useremail = None
    return {'useremail': useremail}