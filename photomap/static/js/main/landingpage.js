/*jslint */
/*global $ */

"use strict";

function initialize() {
   $(".mp-option-to-login").bind('click', function () {
      window.location.href = "/login";
   });
}
