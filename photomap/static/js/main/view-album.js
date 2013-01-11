/*jslint */
/*global $, main, mpEvents */

"use strict";

var gallery, $container, map, information, cursor, tools, state, controls;

function initialize() {
   state = main.getUIState();
   
   $(".mp-option-to-dashboard").hide();
}

function initializeAfterAjax() {
   
   if (state && state.getPlaces()[0]) {
      state.getPlaces()[0].triggerDoubleClick();
   }
   if (main.getClientState().isAdmin()) {
      $(".mp-option-to-dashboard").show();
   }
}

