/*jslint */
/*global $, main, mpEvents */

"use strict";

var state;

function initializeAfterAjax() {
   state = main.getUIState();

   $(".mp-page-title h1")
      .css("cursor", "pointer")
      .addClass("mp-control");
   if (state && state.getPlaces()[0]) {
      state.getPlaces()[0].triggerDoubleClick();
   }
}

