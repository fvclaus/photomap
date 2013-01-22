/*jslint */
/*global $, InfoMarker, Photo, main, ZOOM_LEVEL_CENTERED, google */

"use strict";

/**
 * Place.js
 * @author Frederik Claus
 * @class Place stores several pictures and is itself stored in the map
*/

var Place;

Place = function (data) {

   var i, len;
   
   data.model = 'Place';
   InfoMarker.call(this, data);

   this.photos = [];
   if (data.photos) {
      for (i = 0, len = data.photos.length; i < len; ++i) {
         this.photos.push(new Photo(data.photos[i], i));
      }
   }

   this.checkIconStatus();
   this._bindListener();

};

Place.prototype = InfoMarker.prototype;

Place.prototype._delete = function () {
   this.marker.hide();
};
Place.prototype.center = function () {

   var map, x, y;

   map = main.getMap().getInstance();
   map.setZoom(ZOOM_LEVEL_CENTERED);
   console.log("position " + this.marker.MapMarker.getPosition());
   map.panTo(this.marker.MapMarker.getPosition());
   x = ($("#mp-map").width() * 0.25);
   y = 0;
   map.panBy(x, y);
};
Place.prototype._showGallery = function () {
   main.getUI().getGallery().show(this.photos);
};
/**
 * @description adds photo and restarts gallery
 */
Place.prototype.addPhoto = function (photo) {
   this.photos.push(photo);
   this._showGallery();
};
Place.prototype.sortPhotos = function () {
   // puts photos with order on the right position
   this.photos
      .sort(function (photo, copy) {
         return photo.order - copy.order;
      });
};
Place.prototype.checkIconStatus = function () {
   var status = true;
   this.photos.forEach(function (photo) {
      status = status && photo.visited;
   });

   if (main.getUIState().getCurrentPlace() === this) {
      this.showSelectedIcon();
   } else if (status) {
      this.showVisitedIcon();
   } else {
      this.showUnselectedIcon();
   }
};
/**
 * @private
 */
Place.prototype._bindListener = function () {

   var instance, state, ui, information, controls;

   instance = this;
   state = main.getUIState();
   ui = main.getUI();
   information = ui.getInformation();
   controls = ui.getControls();
   
   google.maps.event.addListener(this.marker.MapMarker, "click", function () {
      
      if (!main.getUI().isDisabled()) {
         state.setCurrentPlace(instance);
         information.updatePlace();
      }
   });
   
   // dblclick event for place (its marker)
   // in the eventcallback this will be the gmap
   // use instance as closurefunction to access the place object
   google.maps.event.addListener(this.marker.MapMarker, 'dblclick', function () {

      var map, oldPlace;

      if (!main.getUIState().isAlbumLoading() && !main.getUI().isDisabled()) {

         if (ui.getInput().isVisible()) {
            ui.getInput().close();
         }
         
         map = main.getMap();
         oldPlace = state.getCurrentLoadedPlace();
         
         controls.hideEditControls(false);
         state.setCurrentPlace(instance);
         state.setCurrentLoadedPlace(instance);
         
         // change icon of new place
         instance.checkIconStatus();
         // change icon of old place
         if (oldPlace) {
            oldPlace.checkIconStatus();
         }
         
         main.getUI().getSlideshow().removeCurrentImage();
         
         instance._showGallery();
      }
   });
};
