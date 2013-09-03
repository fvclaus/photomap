/*jslint */
/*global $, document, window */

"use strict";

$(document).ready(function () {
   
   $("#mp-login-switch").find("a").on("click", function (event) {
      event.preventDefault();
   });
   $("#mp-login-switch span").on("click", function () {
      var $active = $(this),
         $inactive = $("#mp-login-switch").children().not(this);
      
      // Every tab stores the id of its body. Select it and fade it out.
      $($inactive.find("a").attr("href")).fadeOut(100, function () {
         $($active.find("a").attr("href")).fadeIn(100);
      });
      
      $active.addClass("mp-nodisplay");
      $inactive.removeClass("mp-nodisplay");
      
   });

   // Turn the buttons into links.
   $("#mp-demo-button").on("click", function () {
      window.location.href = "/demo";
   });
   $("#mp-dashboard-button").on("click", function () {
      window.location.href = "/dashboard/";
   });
   // automatically sign in when users selects "Try KEIKEN yourself"
   $("#mp-test-button").on("click", function (event) {
      $("#login_email").val("test@keiken.de");
      $("#login_password").val("test");
      $("#login_submit").trigger("click");
   });


   var $loginWrapper = $(".mp-login-link"),
       $loginLink = $loginWrapper.find("a"),
       isLoggedIn = $loginWrapper.size() === 0;
   //check whether user is logged in or not
   if (!isLoggedIn) {
      //TODO This does not work anymore. This script only executes on the landingpage. The location will always be /
      //open the login-box automatically when coming from another non-interactive by clicking on "Login/Registration"
      // if (window.location.pathname !== $loginLink.attr("href")) {
         // $(window).load(function () {
         //    $loginLink.trigger("click");
         //    $("#login_email").focus();
         // });
      // }
      //slide-in login-box
      $loginLink.on("click", function (event) {
         //prevent page from reloading
         if (event) {
            event.preventDefault();
         }
         $("#keiken-login").css("visibility", "visible").animate({
            left : "69%"
         }, 400);
      });
   }

});
