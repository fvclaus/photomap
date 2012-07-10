'''
Created on Jul 10, 2012

@author: fredo
'''
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth import authenticate

from pm.form.authentication import LoginForm

def login(request):
    if request.method == "GET":
        form = LoginForm()
        render_to_response("login.html", {"form" : form})
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(username = form.cleaned_data["username"], password = form.cleaned_data["password"])
            if user == None:
                form.errors["username"] = "Please recheck the username"
                form.errors["password"] = "Please recheck the password"
                render_to_response("login.html", {"form" : form})
            login(request, user)
            return HttpResponseRedirect("/view-album")
        else:
            render_to_response("login.html", {"form" : form})
