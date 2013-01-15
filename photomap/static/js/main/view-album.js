/*jslint */
/*global $, main, mpEvents */

"use strict";

var state;

function initializeAfterAjax() {
   state = main.getUIState();

   if (state && state.getPlaces()[0]) {
      state.getPlaces()[0].triggerDoubleClick();
   }
}

