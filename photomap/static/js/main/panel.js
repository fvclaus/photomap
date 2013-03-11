/*jslint */
/*global $, $$, window, document, assert, assertTrue, assertNumber, DASHBOARD_VIEW */

"use strict";

/**
 * @description Redirects to dashboard if user is logged in, to landing page otherwise
 */
function bindLogoListener () {
   $$(".mp-logo img").bind("click", function (event) {
      // prevent the default anchor forward action
      // the anchor around the logo is needed in case js is disabled or failed
      event.preventDefault();
      
      if ($$("#mp-user").size() > 0) {
         window.location.href = DASHBOARD_VIEW;
      } else {
         window.location.href = "/";
      }
   });
}

function setFontSizeInVH ($el, vh) {
   assertTrue($el.size() > 0, "input parameter $el must not be undefined");
   var fontSize =  (vh / 100) * $("body").height();
   assertNumber(fontSize, "font-size has to be a number");
   $el.css("font-size", fontSize + "px");
   return fontSize;
}

function resizeFont () {
   setFontSizeInVH($("#mp-page-footer"), 2.4);
   setFontSizeInVH($(".mp-page-title > h1"), 5);
}


function bindUserMenuListener () {
   var $menu = $("#menu").menu(),
       $user = $("#mp-user"),
       offset = $user.offset(),
       //TODO width is not used right now
       toggle = function () {
          $menu.toggle("slide", { direction : "down" });   
       };

   // user is logged in
   if ($user.size() === 1) {
      setFontSizeInVH($user, 2);
      // resize button font size on window resize
      $(window).resize(function () {
         setFontSizeInVH($user, 2);
      });
      assertTrue(offset.top >= 0 && offset.left >= 0, "offset of $user must not be negative");
      $menu
         .css({
            top : offset.top - $menu.outerHeight(),
            left : offset.left
         });

      $user
         .button({ icons : { primary : "ui-icon-triangle-1-n" } })
         .on("click", function () {
            toggle();
         });
      // hide the button when something else is clicked
      $("body")
         .on("click", function (event) {
            var isMenu = event.target.id === "menu" || $.contains($menu[0], event.target),
                // jquery ui button adds several spans inside the button, therefore the $.contains is necessary
                isButton = event.target.id === "mp-user" || $.contains($user[0], event.target);
            if (!isMenu && !isButton && $menu.is(":visible")){
               toggle();
            }
         });

      $menu.width($user.width());
   }
}


$(window).on("resize", function () {
   resizeFont();
});

$(document).ready(function () {
   
   resizeFont();

   bindLogoListener();
   // this will probably not work in ie or similiar
   // css3 allows resizing the font in % of the viewport height
   // this is currently not supported by ff
   // source: http://dev.w3.org/csswg/css3-values/#vw-unit
   // vh is supported in ff 19 and chrome 20
   bindUserMenuListener();
   // main.getUI().getTools().centerElement($(".mp-page-title"), $(".mp-page-title h1"), "vertical");
});

