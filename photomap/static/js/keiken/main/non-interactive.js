/*jslint */
/*global $, document */

/**
 * @description Provides common setup for all non-interactive pages.
 * Currently this involves adding validators styling buttons, decrypting email addresses.
 * It also includes site-specifc setup.
 */

"use strict";


/**
 * @description Js-modulo does not work if the first number is negative (eg. -5%4 = -1 | instead of 3)
 * You can fix that bug by adding the second number and do a modulo calculation again.
 * It also includes non common scripts. These should be kept short.
 */
function modulo (x, y) {
   return ((x % y) + y) % y;
}

/**
 * @description Decodes the field and updates the text in it.
 * @param {jQuery} $email Element holding the encoded text
 */
function decodeEmail ($email) {
   if ($email.size() !== 0) {
      
      var email = $email.text(),
          i = 0,
          emailDecoded = "";

      for (i = 0; i <= email.length; i++) {
         
         if (modulo(i, 5) === 0) {
            emailDecoded += email.charAt(i - 1);
         }
      }
      $email
         .text(emailDecoded)
         .removeClass("mp-nodisplay");
   }
}

// adds a validator and button styling to all forms
function startFormValidator () {
   console.log("Attaching $.validate to every .mp-form");
   $(".mp-form")
      .find(".mp-form-submit")
      .button({ icons : { primary : "ui-icon-play" } })
      .end()
      .validate({
         success : "valid",
         errorPlacement : function () {} //don't show any errors
      });
}

// there is no need to use initialize here. initialize just bloats the whole application and starts later
$(document).ready(function () {

   var hash = window.location.hash.substring(1,window.location.hash.length),
      spaceUsage = [];
   
   startFormValidator();
   // single point of control. we don't want to spread selectors throught the code
   decodeEmail($("#mp-email-jsenabled"));
   
   if ($("body").attr("id") === "help") {
      $("#help-navigation a").on("click", function (event) {
         event.preventDefault();
         var $link = $(this);
         
         if (!$link.hasClass("mp-active-link")) {
            $(".mp-active-link").removeClass("mp-active-link");
            $link.addClass("mp-active-link");
            $(".mp-active-section").fadeOut(200, function () {
               $(".mp-active-section").removeClass("mp-active-section");
               $($link.attr("href")).addClass("mp-active-section").fadeIn(200);
            });
         }
      });
      
      $(".mp-tutorial-tabs-wrapper").tabs({
         heightStyle: "filled"
      });
      
      $("#mp-tutorial").hide();
      if (hash) {
         $("#help-navigation").find("a[name='" + hash + "']").click();
      }
   }
   // display all tags that are marked as buttons as ui-buttons
   $(".mp-button").button();
});

