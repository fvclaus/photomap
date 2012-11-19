/*jslint */
/*global $ */

"use strict";


/**
 * @description Resizes and positions Login and Registration forms next to each other
 */

var $login, $register, $container, loginHeight, registerHeight, height, loginMarginTop, registerMarginTop;

function positionLoginForms() {
   $login = $container.find("#mp-login");
   $register = $container.find("#mp-register");

   // resizing
   loginHeight = $container.height();
   registerHeight = loginHeight;
   $login.height(loginHeight);
   $register.height(registerHeight);

   // repositioning
   height = $container.height();
   loginMarginTop = height * 0.25;
   registerMarginTop = height * 0.25;
   $login.find("form").css('margin-top', loginMarginTop);
   $register.find("form").css('margin-top', registerMarginTop);
}

function initialize() {
   $container = $("#mp-non-interactive-content");
   positionLoginForms();
}

