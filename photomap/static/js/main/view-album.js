/*jslint indent: 3, nomen: true, devel: true, plusplus: true */
/*global $, main, mpEvents */

"use strict";

var gallery, $container, map, information, cursor, tools, state, controls;


function toggleGallery() {
   $container = $("#mp-album");
   gallery = main.getUI().getGallery();

   if ($container.is(":visible")) {
      $container.fadeOut(100);
      $(".mp-gallery-visible").hide();
      $(".mp-gallery-hidden").show();
      // trigger event to expose album
      gallery._setVisibility(false);
      mpEvents.trigger("body", mpEvents.toggleExpose);
   } else {
      $container.fadeIn(500);
      $(".mp-gallery-hidden").hide();
      $(".mp-gallery-visible").show();
      // trigger event to close mask
      gallery._setVisibility(true);
      mpEvents.trigger("body", mpEvents.toggleExpose);
   }
}
/*
 * @description Checks if gallery or description are visible. If yes -> they'll get exposed
 */
function bindExposeListener() {
   gallery = main.getUI().getGallery();
   map = main.getMap();

   $("body").bind('toggleExpose', function () {
      // change exposé depending on visibility of gallery and description
      if (information.isVisible() && gallery.isVisible() && !map.getPanorama().getVisible()) {
         if ($.mask.isLoaded() === "full") {
            $.mask.close();
         }
         $("#mp-album, #mp-description").expose({'opacity': 0.7, 'closeSpeed': 0});
         tools.fitMask($("#exposeMask"));
      } else if (!information.isVisible() && gallery.isVisible() && !map.getPanorama().getVisible()) {
         $("#mp-album").expose({'opacity': 0.7, 'closeSpeed': 0});
         tools.fitMask($("#exposeMask"));
      } else if (information.isVisible() && !gallery.isVisible() && !map.getPanorama().getVisible()) {
         $("#mp-description").expose({'opacity': 0.7, 'closeSpeed': 0});
         tools.fitMask($("#exposeMask"));
      } else {
         $.mask.close();
      }
      // z-index has to be more than mask but less than controls
      $("#mp-album").css('z-index', 1025);
      $("#mp-description").css('z-index', 1025);
   });
}
function bindIFrameListener() {
   $("body").bind('iframe_close', function () {
      state.setFileToUpload(null);
      mpEvents.trigger("body", mpEvents.toggleExpose);
   });
}
function bindGalleryListener() {
   $(".mp-option-toggle-gallery").bind("click", function () {
      toggleGallery();
   });
}

function initialize() {
   map = main.getMap();
   information = main.getUI().getInformation();
   cursor = main.getUI().getCursor();
   tools = main.getUI().getTools();
   state = main.getUIState();
   controls = main.getUI().getControls();

   // add listeners, which are for guests and admins
   bindGalleryListener();
   bindExposeListener();
   bindIFrameListener();

   $("#mp-album").hide();
   $(".mp-option-to-dashboard").hide();
}

function initializeAfterAjax() {
   if (main.getClientState().isAdmin()) {
      $(".mp-option-to-dashboard").show();
   }
}

