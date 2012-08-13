'''
Created on Jul 10, 2012

@author: fredo
'''
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

from pm.form.authentication import LoginForm,RegisterForm

def login(request):
    if request.method == "GET":
        loginform = LoginForm()
        registerform = RegisterForm()
        data = {"login" : loginform, "register" : registerform}
        return render_to_response("login.html", data)
    if request.method == "POST":
        loginform = LoginForm(request.POST)
        if loginform.is_valid():
            user = authenticate(username = loginform.cleaned_data["username"], password = loginform.cleaned_data["password"])
            if user == None:
                loginform.errors["email"] = "Please recheck the username"
                loginform.errors["password"] = "Please recheck the password"
                render_to_response("login.html", data)
            auth_login(request, user)
            return HttpResponseRedirect("/view-album")
        else:
            return render_to_response("login.html", data)
        
def logout(request):
    auth_logout(request)
    return HttpResponseRedirect("/")
