/*jslint */
/*global $, main */

"use strict";

var map, state, cursor, tools, $container;

function reinitialiseScrollPane() {
   if ($container.data("jsp")) {
      $container.data("jsp").reinitialise();
   }
}

function initializeNonInteractive() {

   $container = $("#mp-non-interactive-content");

   if (window.location.pathname !== "/login") {
      $container.jScrollPane();
   }

   // if window is resized content container needs to be repositioned
   $(window).resize(function () {
      reinitialiseScrollPane();
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

