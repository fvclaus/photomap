/*jslint */
/*global $, document, window, main */

"use strict";

$(document).ready(function () {
   
   var index = 0,
       hash = window.location.hash;
   
   switch (hash) {
   case "#mp-login":
      index = 0;
      break;
   case "#mp-register":
      index = 1;
      break;
   default:
      index = 0;
      break;
   }
   $("#mp-login-register").tabs({
      // heightStyle : "fill",
      disabled : [1],
      active : index
   });
});

