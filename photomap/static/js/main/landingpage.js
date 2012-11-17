/*jslint indent: 3, nomen: true, devel: true, plusplus: true, browser: true */
/*global $ */

"use strict";

function initialize() {
   $(".mp-option-to-login").bind('click', function () {
      window.location.href = "/login";
   });
}
