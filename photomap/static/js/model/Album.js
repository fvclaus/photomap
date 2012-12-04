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

Album.prototype._delete = function () {
   this.marker.hide();
};

/*
 * @private
 */
Album.prototype._bindListener = function () {
   
   var state, controls, instance = this;
   state = main.getUIState();
   controls = main.getUI().getControls();

   /*
    * @description Redirects on albumview of selected album.
    */
   google.maps.event.addListener(this.marker.MapMarker, "click", function () {
      
      var information = main.getUI().getInformation();
      
      information.updateAlbumDescription();
      information.updateAlbumTitle();
   });
   google.maps.event.addListener(this.marker.MapMarker, "dblclick", function () {
      
      var url = '/view-album?id=' + instance.id;
      
      state.setCurrentAlbum(instance);
      window.location.href=url;
   });
};


Album.prototype.checkIconStatus = function(){
   this.showVisitedIcon();
};
