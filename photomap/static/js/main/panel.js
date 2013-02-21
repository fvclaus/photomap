/*jslint */
/*global $, main, ALBUM_VIEW, window */

"use strict";

var initializePanels, bindLogoListener, bindTitleListener, resizeFooterFont, showDropupMenu, hideDropupMenu, menuEntered, bindUserMenuListener, menuHeight, menuTimeoutId;
/**
 * @description Redirects to dashboard if user is logged in, to landing page otherwise
 */
bindLogoListener = function () {
   $(".mp-logo img").bind("click", function (event) {
      // prevent the default anchor forward action
      // the anchor around the logo is needed in case js is disabled or failed
      event.preventDefault();
      
      if ($(".mp-user").size() > 0) {
         window.location.href = "/dashboard";
      } else {
         window.location.href = "/";
      }
   });
};

showDropupMenu = function () {
   
   var $menu, offset, width;
   $menu = $("#mp-user-menu");
   offset = $("#mp-user").offset();
   width = $("#mp-user-mail").width() + $("#mp-user-mail").next().width();
   
   if (!$menu.is(":visible")) {
      $menu.show();
      $menu
         .css({
            top: offset.top,
            left: offset.left,
            height: "1px"
         })
         .show()
         .animate({
            top: offset.top - menuHeight,
            height: menuHeight
         }, 200);
   }
};
hideDropupMenu = function (timer) {
   
   var $menu, hideMenu, setMenuTimer;
   $menu = $("#mp-user-menu");
   
   hideMenu = function () {
      
      if (menuEntered) {
         setMenuTimer();
         return;
      }
      if ($menu.is(":visible")) {
         
         $menu.fadeOut(300);
      }
   };
   setMenuTimer = function () {
      
      window.clearTimeout(menuTimeoutId);
      menuTimeoutId = window.setTimeout(hideMenu, 1000);
   };
   if (timer) {
      
      setMenuTimer();
      
   } else {
      
      hideMenu();
   }
};
resizeFooterFont = function () {
   
   var $footer, text, width, height, tools, size;
   
   $footer = $("footer#mp-page-footer");
   text = $footer.find(".mp-internal-links a").first().text();
   width = $(".mp-internal-links").width();
   height = $footer.height();
   tools = main.getUI().getTools();
   size = tools.calculateFontSize(text, width, height);
   
   $footer.css("fontSize", size + "px");
};

bindUserMenuListener = function () {
   
   $("#mp-user-mail")
      .on("mouseenter", function () {
         window.clearTimeout(menuTimeoutId);
         menuTimeoutId = null;
         showDropupMenu();
      })
      .on("mouseleave", function () {
         hideDropupMenu(true);
      })
      .on("click", function () {
         showDropupMenu();
      });
   $("#mp-user-menu")
      .on("mouseenter", function () {
         menuEntered = true;
      })
      .on("mouseleave", function () {
         menuEntered = false;
         hideDropupMenu(false);
      });
   $("body").on("click.UserMenuHide", function () {
      hideDropupMenu(false);
   });
};
initializePanels = function () {
   
   menuHeight = $("#mp-user-menu").outerHeight();

   bindLogoListener();
   // this will probably not work in ie or similiar
   // css3 allows resizing the font in % of the viewport height
   // this is currently not supported by ff
   // source: http://dev.w3.org/csswg/css3-values/#vw-unit
   // vh is supported in ff 19 and chrome 20
   bindUserMenuListener();
   main.getUI().getTools().centerElement($(".mp-page-title"), $(".mp-page-title h1"), "vertical");
};