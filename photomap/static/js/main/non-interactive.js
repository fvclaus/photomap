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
   
   
   if ($("body").attr("id") === "landingpage") {
      // show tabs on login box
      $("#keiken-login").tabs({
         heightStyle : "fill",
         active: 0,
         disabled : [1]
      });
      //change href of login-link to prevent reloading of the page
      $(".mp-login-link").find("a").attr("href", "#login");
      // close login-box on click
      $(".login-toggle").on("click", function (event) {
         $("#keiken-login").fadeOut(300, function () {
            $("#keiken-login").css({
               visibility: "hidden",
               display: "block",
               left: "100%"
            });
         });
      });
      // automatically sign in when users selects "Try KEIKEN yourself"
      $(".mp-test-button").on("click", function (event) {
         $("#login-email").val("test@keiken.app");
         $("#login-password").val("test");
         $("#login-submit").trigger("click");
      });
      //check whether user is logged in or not
      if ($(".mp-login-link").size() > 0) {
         //open the login-box automatically when coming from another non-interactive by clicking on "Login/Registration"
         if (window.location.hash === "#login") {
            $(window).load(function () {
               $(".mp-login-link").find("a").trigger("click");
               $("#login_email").focus();
            });
         }
         //slide-in login-box
         $(".mp-login-link").find("a").on("click", function (event) {
            //prevent page from reloading
            if (event) {
               event.preventDefault();
            }
            $("#keiken-login").css("visibility", "visible").animate({
               left : "74%"
            }, 400);
            $("#keiken-login").tabs("option", "active", 0)
            
         });
      }
      
      
   }
   // display all tags that are marked as buttons as ui-buttons
   $(".mp-button").button();
});

