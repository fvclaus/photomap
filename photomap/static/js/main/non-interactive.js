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
//TODO I really don't know why this was in UITools. This function is used only once and only here.
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

// there is no need to use initialize here. initialize just bloats the whole application and starts later
$(document).ready(function () {

   // adds a validator and button styling to all forms
   $(".mp-form")
      .find(".mp-form-submit")
      .button({ icons : { primary : "ui-icon-play" } })
      .end()
      .validate({
         success : "valid",
         errorPlacement : function () {} //don't show any errors
      });

   // single point of control. we don't want to spread selectors throught the code
   decodeEmail($("#mp-email-jsenabled"));
   
   // show tabs on login page
   $("#mp-login-register")
      .tabs({
         // disable registaration for now
         disabled : [1],
      })
   // tabs are hidden during page load, so they don't move around
      .find("section")
      .removeClass("mp-nodisplay");
   // display all tags that are marked as buttons as ui-buttons
   $(".mp-button").button();
});

