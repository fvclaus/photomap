/*jslint */
/*global $, main, ALBUM_VIEW */

"use strict";

var initializePanels, bindLogoListener, bindTitleListener, resizeFooterFont, showDropupMenu, hideDropupMenu, isMenuEntered, bindUserMenuListener;

bindLogoListener = function () {
   $(".mp-logo img").bind("click", function () {
      
      if (!main.getUI().isDisabled()) {
         if ($(".mp-user").size() > 0) {
            window.location.href = "/dashboard";
         } else {
            window.location.href = "/";
         }
      }
   });
};
bindTitleListener = function () {
   
   var instance = this;
      
   $(".mp-page-title h1").on('click', function () {
      
      if (!main.getUI().isDisabled()) {
         
         instance.updateAlbum();
      }
   });
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

showDropupMenu = function () {
   
   var $menu, offset, width, height;
   $menu = $("#mp-user-menu");
   offset = $("#mp-user").offset();
   width = $("#mp-user-mail").width() + $("#mp-user-mail").next().width();
   height = $menu.outerHeight();
   
   if (!$menu.is(":visible")) {
      
      $menu
         .css({
            top: offset.top,
            left: offset.left
//            width: width
         })
         .show()
         .animate({
            top: offset.top - height
         }, 200);
   }
};
hideDropupMenu = function (timer) {
   
   var $menu, hideMenu, setMenuTimer;
   $menu = $("#mp-user-menu");
   
   hideMenu = function () {
      
      if (isMenuEntered) {
         setMenuTimer();
         return;
      }
      $menu.fadeOut(400);
   };
   setMenuTimer = function () {
      window.setTimeout(hideMenu, 1000);
   };      
   if ($menu.is(":visible")) {
      
      if (timer) {
         
         setMenuTimer();
         
      } else {
      
         hideMenu();
      }
   }
};
bindUserMenuListener = function () {
   
   $("#mp-user-mail")
      .on("mouseenter", function () {
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
         isMenuEntered = true;
      })
      .on("mouseleave", function () {
         isMenuEntered = false;
      });
};
initializePanels = function () {
   
   bindLogoListener();
   resizeFooterFont();
   bindUserMenuListener();
   main.getUI().getTools().centerElement($(".mp-page-title"), $(".mp-page-title h1"), "vertical");
   if (main.getUIState().getPage() === ALBUM_VIEW) {
      bindTitleListener();
      $(".mp-page-title").trigger("click");
   }


};