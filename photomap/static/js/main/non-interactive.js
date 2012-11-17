/*jslint indent: 3, nomen: true, devel: true, plusplus: true, browser: true */
/*global $, main */

"use strict";

var position, left, top, $container;

function repositionContent() {
   position = $(".mp-map").position();
   left = ($(".mp-map").width() - $container.width()) * 0.5;
   $container.css({
      'top': position.top,
      'left': left
   });
}

function initScrollPane() {
   $container.jScrollPane();
}

var map, state, cursor;

function initializeNonInteractive() {

   // have to declare the map variable here, no idea why though :S
   map = main.getMap();
   state = main.getUIState();
   cursor = main.getUI().getCursor();
   $container = $("#mp-non-interactive-content");

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

