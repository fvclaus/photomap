/*jslint */
/*global $, main */

"use strict";

var initializePanels, bindLogoListener, resizeFooterFont;

bindLogoListener = function () {
   $(".mp-logo img").bind("click", function () {
      
      if (!main.getUI().isDisabled()) {
         if ($(".mp-user").size() > 0) {
            window.location.href = "/dashboard";
         } else {
            window.location.href = "/";
         }
      }
   });
};
resizeFooterFont = function () {
   
   var $footer, text, width, height, tools, size;
   
   $footer = $("footer#mp-page-footer");
   text = $footer.find(".mp-internal-links a").first().text();
   width = $(".mp-internal-links").width();
   height = $footer.height();
   tools = main.getUI().getTools();
   size = tools.calculateFontSize(text, width, height);
   
   $footer.css("fontSize", size + "px");
};

initializePanels = function () {
   
   bindLogoListener();
   resizeFooterFont();
   main.getUI().getTools().centerElement($(".mp-page-title"), $(".mp-page-title h1"), "vertical");

};