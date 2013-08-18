/*jslint */
/*global $, document */

"use strict";

$(document).ready(function () {
   
   $("#mp-login-switch").find("a").on("click", function (event) {
      event.preventDefault();
   });
   $("#mp-login-switch span").on("click", function () {
      var $active = $(this),
         $inactive = $("#mp-login-switch").children().not(this);
      
      $($inactive.find("a").attr("href")).fadeOut(100, function () {
         $($active.find("a").attr("href")).fadeIn(100);
      });
      
      $active.addClass("mp-nodisplay");
      $inactive.removeClass("mp-nodisplay");
      
   });
   //change href of login-link to prevent reloading of the page
   $(".mp-login-link").find("a").attr("href", "#login");
   $("#mp-demo-button").on("click", function () {
      window.location.href = "/demo"   
   });
   $("#mp-dashboard-button").on("click", function () {
      window.location.href = "/dashboard/"   
   });
   // automatically sign in when users selects "Try KEIKEN yourself"
   $("#mp-test-button").on("click", function (event) {
      $("#login_email").val("test@keiken.app");
      $("#login_password").val("test");
      $("#login_submit").trigger("click");
   });
   //check whether user is logged in or not
   if ($(".mp-login-link").size() > 0) {
      //open the login-box automatically when coming from another non-interactive by clicking on "Login/Registration"
      if (window.location.pathname === "/account/auth/login") {
         console.log(window.location.pathname);
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
   }

});
