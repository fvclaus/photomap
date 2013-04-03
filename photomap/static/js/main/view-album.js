/*jslint */
/*global $, $$, main, mpEvents */

"use strict";

var state;

function init() {
   var album = main.getUIState().getCurrentLoadedAlbum();
   $$(".mp-page-title h1").on('click', function () {

      if (!main.getUI().isDisabled()) {
         require(["view/DetailView"], function (detailView) {
            detailView.update(album);
         });
      }
   });
}

