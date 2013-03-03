/*global $, console*/
"use strict";

function $$ (selector){
   var selection = $(selector);
   if (selection.length === 0 && console && console.warn) {
      console.warn(selection.selector+':jQuery selector returned no matches');
   }
   return selection;
}