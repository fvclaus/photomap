/*jslint */
/*global $, main */

"use strict";

var position, tools, $container, $leftPlaceholder, $rightPlaceholder;

function repositionContent() {
   position = $("#mp-map").position();

   $leftPlaceholder.css({
      width: tools.getRealWidth($("#mp-container")) * 0.13,
      top: position.top,
      left: position.left
   });
   $container.css({
      width: tools.getRealWidth($("#mp-container")) * 0.6,
      marginTop: $("#mp-map").css("padding"),
      top: position.top,
      left: position.left + $leftPlaceholder.width()
   });
   $rightPlaceholder.css({
      width: tools.getRealWidth($("#mp-container")) * 0.13,
      top: position.top,
      left: position.left + $leftPlaceholder.width() + $container.width()
   });
   console.log((tools.getRealWidth($("#mp-container")) * 0.16 + tools.getRealWidth($("#mp-container")) * 0.66 + tools.getRealWidth($("#mp-container")) * 0.16) / tools.getRealWidth($("#mp-container")));
}

function initScrollPane() {
   if (window.location.pathname !== "/login") {
      $container.jScrollPane();
   }
}

var map, state, cursor;

function initializeNonInteractive() {

   // have to declare the map variable here, no idea why though :S
   map = main.getMap();
   state = main.getUIState();
   cursor = main.getUI().getCursor();
   tools = main.getUI().getTools();
   $container = $("#mp-non-interactive-content");
   $leftPlaceholder = $(".mp-left-noninteractive-placeholder");
   $rightPlaceholder = $(".mp-right-noninteractive-placeholder");

   repositionContent();
   initScrollPane();

   // if window is resized content container needs to be repositioned
   $(window).resize(function () {
      repositionContent();
      initScrollPane();
   });

   /**
    * @description When linked to a certain part of a page, scroll to that part.
    */

   var hash, api;

   hash = window.location.hash;
   if (hash) {
      api = $container.jScrollPane().data('jsp');
      api.scrollToElement(hash, true, true);
   }
}

