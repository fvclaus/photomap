/*jslint */
/*global $, main, InfoMarker, google */

"use strict";

/*
 * Album.js
 * @author Marc Roemer
 * @class Models an album that holds an unspecified amount of places
 */

var Album;

Album = function (data) {
   
   data.model = 'Album';
   InfoMarker.call(this, data);
   
   this.checkIconStatus();
   this._bindListener();

};

Album.prototype = InfoMarker.prototype;

Album.prototype.delete = function () {
   this.marker.hide();
};

/*
 * @private
 */
Album.prototype._bindListener = function () {
   
   var state, information, instance = this;
   state = main.getUIState();
   information = main.getUI().getInformation();
   /*
    * @description Redirects on albumview of selected album.
    */
   google.maps.event.addListener(this.marker.MapMarker, "click", function () {
      
      if (!main.getUI().isDisabled()) {
         state.setCurrentAlbum(instance);
         state.setCurrentLoadedAlbum(instance);
         information.updateAlbumDescription();
         information.updateAlbumTitle();
      }
   });
   google.maps.event.addListener(this.marker.MapMarker, "dblclick", function () {
      
      if (!main.getUI().isDisabled()) {
         
         var url = '/view-album?id=' + instance.id;
         window.location.href = url;
      }
   });
};


Album.prototype.checkIconStatus = function () {
   this.showVisitedIcon();
};
