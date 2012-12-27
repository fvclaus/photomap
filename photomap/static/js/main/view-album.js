/*jslint */
/*global $, main, mpEvents */

"use strict";

var gallery, $container, map, information, cursor, tools, state, controls;


function bindIFrameListener() {
   $("body").bind('iframe_close', function () {
      state.setFileToUpload(null);
      mpEvents.trigger("body", mpEvents.toggleExpose);
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
   bindIFrameListener();
   
   $(".mp-option-to-dashboard").hide();
}

function initializeAfterAjax() {
   
   if (state && state.getPlaces()[0]) {
      state.getPlaces()[0].triggerClick();
   }
   
   if (main.getClientState().isAdmin()) {
      $(".mp-option-to-dashboard").show();
   }
}

