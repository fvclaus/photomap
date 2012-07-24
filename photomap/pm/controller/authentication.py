'''
Created on Jul 10, 2012

@author: fredo
'''
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

from pm.form.authentication import LoginForm

def login(request):
    if request.method == "GET":
        form = LoginForm()
        return render_to_response("login.html", {"form" : form})
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(username = form.cleaned_data["user"], password = form.cleaned_data["password"])
            if user == None:
                form.errors["username"] = "Please recheck the username"
                form.errors["password"] = "Please recheck the password"
                render_to_response("login.html", {"form" : form})
            auth_login(request, user)
            return HttpResponseRedirect("/view-album")
        else:
            return render_to_response("login.html", {"form" : form})
        
def logout(request):
    auth_logout(request)
    return HttpResponseRedirect("/")
