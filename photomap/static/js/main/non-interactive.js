/*jslint */
/*global $, main */

"use strict";

var map, state, tools, $container, email, $email,  emailEncoded, size;

function decMail($email) {
   
   var i;
   
   email = $email.text();
   emailEncoded = "";
   for (i = 0; i <= email.length; i++) {
      
      if (main.getUI().getTools().modulo(i, 5) === 0) {
         
         emailEncoded += email.charAt(i - 1);
      }
   }
   $email
      .text(emailEncoded)
      .removeClass("mp-nodisplay");
}
function initialize() {
   
   var i, hash;

   //TODO this needs to be centralized somewhere
   $(".jquery-validator")
      .find("input[type='submit']").button()
      .end()
      .validate({
         success : "valid",
         errorPlacement : function () {} //don't show any errors
      });

   $container = $("#mp-non-interactive-content");
   
   if ($(".mp-email-jsenabled").size() !== 0) {
      
      size = $(".mp-email-jsenabled").size();
      for (i = 0; i < size; i++) {
         $email = $($(".mp-email-jsenabled")[i]);
         decMail($email);
      }
   }
   
   /**
    * @description When linked to a certain part of a page, scroll to that part.
    */

   hash  = window.location.hash;
   if (window.location.pathname !== "/login" && hash && hash.length !== 0) {
      console.log("scrolling");
      $("html, body").animate({
         scrollTop: $(hash).offset().top
      }, 0, "swing", function () {
         $(hash).animate({
            backgroundColor: "#aaa"
         }, 1000, "swing", function () {
            $(hash).animate({
               backgroundColor: "#fafafa"
            }, 1000);
         });
      });
   }
}

