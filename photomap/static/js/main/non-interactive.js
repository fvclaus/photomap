/*jslint */
/*global $, main */

"use strict";

var map, state, tools, $container, email, emailEnabled, i;

function reinitialiseScrollPane() {
   if ($container.data("jsp")) {
      $container.data("jsp").reinitialise();
   }
}

function initialize() {

   //TODO this needs to be centralized somewhere
   $(".jquery-validator")
      .find("input[type='submit']").button()
      .end()
      .validate({
      success : "valid",
      errorPlacement : function () {} //don't show any errors
   });

   $container = $("#mp-non-interactive-content");

   if (window.location.pathname !== "/login") {
      $container.jScrollPane();
   }

   // if window is resized content container needs to be repositioned
   $(window).resize(function () {
      reinitialiseScrollPane();
   });

   /**
    * @description When linked to a certain part of a page, scroll to that part.
    */
   
   if ($("#mp-email-jsenabled").size() !== 0) {
      
      email = $("#mp-email-jsenabled").text();
      emailEnabled = "";
      for (i = 0; i <= email.length; i++) {
         
         if (main.getUI().getTools().modulo(i, 5) === 0) {
            
            emailEnabled += email.charAt(i - 1);
         }
      }
      $("#mp-email-jsenabled")
         .text(emailEnabled)
         .removeClass("mp-nodisplay");
   }
   
   var hash, api;

   hash = window.location.hash;
   if (hash) {
      api = $container.jScrollPane().data('jsp');
      api.scrollToElement(hash, true, true);
   }
}

