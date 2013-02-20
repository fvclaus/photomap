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

Place.prototype = $.extend({},InfoMarker.prototype);

Place.prototype._showGallery = function () {
   main.getUI().getGallery().start();
};
/**
 * @description adds photo and restarts gallery
 */
Place.prototype.insertPhoto = function (photo) {
   this.photos.push(photo);
};
Place.prototype.deletePhoto = function (photo) {
   this.photos = this.photos.filter(function (element, index) {
      return element !== photo;
   });
};
Place.prototype.sortPhotos = function () {
   // puts photos with order on the right position
   this.photos
      .sort(function (photo, copy) {
         return photo.order - copy.order;
      });
};
/**
 * @description Get a photo by src
 * @returns {Photo}  Photo with src present, else null
 */
Place.prototype.getPhoto = function (src) {
   var photo = $.grep(this.photos, function (photo) {
      return photo.photo === src;
   });
   if (photo.length === 0) {
      return null;
   } else {
      return photo[0];
   }
};         
   
Place.prototype.checkIconStatus = function () {
   var visited = true;
   this.photos.forEach(function (photo) {
      visited = visited && photo.visited;
   });

   if (main.getUIState().getCurrentLoadedPlace() === this) {
      this.showSelectedIcon();
   } else if (visited) {
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
   
   this.addListener("click", function () {
      
      if (!main.getUI().isDisabled()) {
         state.setCurrentPlace(instance);
         information.update(instance);
      }
   });
   
   // dblclick event for place (its marker)
   // in the eventcallback this will be the gmap
   // use instance as closurefunction to access the place object
   this.addListener('dblclick', function () {

      var map, oldPlace;

      if (!main.getUI().isDisabled()) {
         //TODO confer Album.js. This does also not work during Place creation, because the UI is disabled
         instance.openPlace();
      }
   });
};

Place.prototype.openPlace = function () {
   var ui = main.getUI(),
      state = ui.getState(),
      oldPlace = state.getCurrentLoadedPlace();
         
   //this is a private function now
   // controls.hideEditControls(false);
   state.setCurrentPlace(this);
   state.setCurrentLoadedPlace(this);
   
   // change icon of new place
   this.checkIconStatus();
   // change icon of old place
   if (oldPlace) {
      oldPlace.checkIconStatus();
   }
   ui.getGallery().reset();
   ui.getSlideshow().reset();
   this._showGallery();
   ui.getInformation().update(this);
};
   