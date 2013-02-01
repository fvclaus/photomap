/*global document, $ */
"use strict";


$(document).ready(function() {
   $("#start").click(function () {
      //shrink the image away
      $("#photo1").animate({
         height: "0px"
      }, {
         duration : 1000,
         complete : function () {
            //image is gone -> replace the sources
            $(this).attr("src", $("#photo2").attr("src"));
            //grow image again
            $(this).animate({
               height : $("#photo2").height()
            }, 1000);
         }
      });
   });
});
      
