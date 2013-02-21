/*jslint */
/*global $, main, mpEvents */

"use strict";

var state;

function initializeAfterAjax() {
   var album = main.getUIState().getCurrentLoadedAlbum();
   $(".mp-page-title h1").on('click', function () {

      if (!main.getUI().isDisabled()) {
         main.getUI().getInformation().update(album);
      }
   });
   //TODO either we automatically select the first album in the dashboard or we don't select anything here
   // state = main.getUIState();

   // $(".mp-page-title h1")
   //    .css("cursor", "pointer")
   //    .addClass("mp-control");
   // if (state && state.getPlaces()[0]) {
   //    state.getPlaces()[0].triggerDoubleClick();
   // }
}

