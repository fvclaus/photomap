/*jslint */
/*global $, fileUpload */

"use strict";

$.tools.validator.fn("[type=file]", function (el, value) {
   return /\.(jpg|png)$/i.test(value) ? true : "only jpg or png allowed";
});

$(document).ready(function () {

   /**
    * @description bind all upload events on the /insert-photo form
    */
   if ($("input#file-input")) {
      $("#file-input").bind('change', fileUpload.handleFileInput);
   }
   $('.mp-single-upload').bind('click', function () {
      fileUpload.startUpload();
   });
});
