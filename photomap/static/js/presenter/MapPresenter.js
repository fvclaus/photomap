/*global $, main, PlacePresenter, AlbumPresenter */


"use strict";

var MapPresenter = function () {
   this.placePresenter = new PlacePresenter();
   this.albumPresenter = new AlbumPresenter();
};


MapPresenter.prototype = {
   click : function (event) {
      var instance = this, 
          state = main.getUI().getState();      

      if (!main.getUI().isDisabled()) {
            //create new place with description and select it
            if (!state.isDashboardView()) {
               instance.placePresenter.insert(event);
            } else {
               instance.albumPresenter.insert(event);
            }
         }
      
   }
};