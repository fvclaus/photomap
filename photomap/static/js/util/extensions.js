/*jslint */
/*global jQuery */

"use strict";

var arrayExtension = {
   firstUndef : function (array) {

      var i, index;

      index = -1;
      for (i = 0; i <= array.length; i++) {
         if (array[i] === null) {
            return i;
         }
      }
      return -1;
   },
   /**
    * Array Remove - By John Resig (MIT Licensed)
    *
    * Usage: remove(1) -> remove second item; remove(-2) -> remove second to last; remove(1,2) -> remove second and third
    */
   remove : function (array, from, to) {
      var rest = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, rest);
   }
};

var mpEvents = {
   trigger : function (element, event) {
      jQuery(element).trigger(event);
   },
   toggleExpose: jQuery.Event("toggleExpose"),
   iframeClose: jQuery.Event("iframe_close"),
};
