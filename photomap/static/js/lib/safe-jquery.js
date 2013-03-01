/*global $, console*/
"use strict";

function $$(){
   var selection = $.apply(this,arguments);
   if (selection.length === 0 && console && console.warn) {
      console.warn(selection.selector+':jQuery selector returned no matches');
   }
   return selection;
}