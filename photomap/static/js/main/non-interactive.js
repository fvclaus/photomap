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

function bindPasswordForgotListener () {
   require(["view/DialogView"], function () {
      var DialogView = require("view/DialogView"),
         input = new DialogView();
      $$("#mp-user-password-forgot").on("click", function (event) {
         input.show({
            url : "/reset-user-password"
         });
      });
   });
}
// there is no need to use initialize here. initialize just bloats the whole application and starts later
$(document).ready(function () {

   var hash = window.location.hash.substring(1,window.location.hash.length),
      data = {};
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
   
   if ($("body").attr("id") === "landingpage") {
      var $loginCloseWidth = $(".mp-login-toggle").find("img").width() + 3 + "px";
      console.log("---------------------------");
      console.log($loginCloseWidth);
      // show tabs on login box
      $("#keiken-login").tabs({
         //heightStyle : "auto",
         active: 0,
         disabled : [1]
      });
      $(".mp-login-link, .login-toggle").button();
      $(".mp-login-toggle .ui-button-text").css({
         padding: 0
      });
      $(".mp-login-link .ui-button-text").css({
         padding: "2px"
      });
      $(".mp-login-toggle").css({
         width: $loginCloseWidth,
         height: $loginCloseWidth,
         padding: "1.5px"
      });
      //change href of login-link to prevent reloading of the page
      $(".mp-login-link").find("a").attr("href", "#login");
      // close login-box on click
      $(".mp-login-toggle").on("click", function (event) {
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
         $("#login_email").val("test@keiken.app");
         $("#login_password").val("test");
         $("#login_submit").trigger("click");
      });
      //check whether user is logged in or not
      if ($(".mp-login-link").size() > 0) {
         //open the login-box automatically when coming from another non-interactive by clicking on "Login/Registration"
         if (window.location.pathname === "/login") {
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
               left : "69%"
            }, 400);
            $("#keiken-login").tabs("option", "active", 0)
            
         });
         
         $("#login_submit").on("click", function (event) {
            event.preventDefault();
            var data = {};
            
           $.each($("#mp-login").find("form").serializeArray(), function(i, field) {
              data[field.name] = field.value;
           });
           
           $.ajax({
              url: $("#mp-login").find("form").attr("action"),
              type: "POST",
              "data": data,
              success: function (data) {
                 $("#login-request-fail").empty();
                 /**
                  * if the request is succesful in the way that the user got logged in then the user will get redirected to the dashboard
                  * else /login will return data containing information about what went wrong and this data is getting displayed here
                  */
                 if (data) {
                    console.log(data);
                    if (data.success) {
                       window.location.href = data.next;
                    } else {
                       $("#login_email").val(data.email);
                       $("#login_password").val("");
                       if (data.login_invalid) {
                          $("#login-fail").text(gettext("LOGIN_INVALID"));
                       } else if (data.form_invalid) {
                          $("#login-fail").text(gettext("LOGIN_FORM_INVALID"));
                       } else if (data.user_inactive) {
                          $("#login-fail").text(gettext("LOGIN_USER_INACTIVE"));
                       }
                    }
                 } else {
                    $("#login-fail").text(gettext("LOGIN_UNKNOWN_FAIL"));
                 }
              },
              error: function (jqXHR, textStatus, errorThrown) {
                 $("#login-fail").empty();
                 $("#login-request-fail").text(textStatus + ": " + errorThrown);
              }
           });
         });
         
         bindPasswordForgotListener();
      }
   }
   // display all tags that are marked as buttons as ui-buttons
   $(".mp-button").button();
});

