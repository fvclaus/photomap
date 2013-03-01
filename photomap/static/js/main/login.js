/*jslint */
/*global $, main */

"use strict";

function init() {
   
   var index, hash = window.location.hash;
   
   switch (hash) {
   case "#mp-login":
      index = 0;
      break;
   case "#mp-test":
      index = 1;
      break;
   case "#mp-demo":
      index = 2;
      break;
   case "#mp-register":
      index = 3;
      break;
   case "#mp-guest":
      index = 4;
      break;
   default:
      index = 0;
      break;
   }
   $("#mp-login-register").tabs({
      heightStyle : "fill",
      disabled : [3],
      active : index
   });
}

