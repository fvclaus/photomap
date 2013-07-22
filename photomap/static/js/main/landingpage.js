/*jslint */
/*global $, document */

"use strict";

$(document).ready(function () {

   var $loginCloseWidth = $(".mp-login-toggle").find("img").width() + 3 + "px";
   // show tabs on login box
   $("#keiken-login").tabs({
      //heightStyle : "auto",
      active: 0,
      //disabled : [1]
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
