/*jslint */
/*global $, main, InfoMarker, google, window, assertTrue */

"use strict";

/*
 * Album.js
 * @author Marc Roemer
 * @class Models an album that holds places
 */

var Album = function (data) {
   assertTrue(data.secret);
   
   data.model = 'Album';
   this.isOwner = data.isOwner || false;
   this.secret = data.secret;
   InfoMarker.call(this, data);
   
   this.checkIconStatus();
   this._bindListener();

};

Album.prototype = $.extend({},InfoMarker.prototype);

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
   this.addListener("click", function () {
      
      if (!main.getUI().isDisabled()) {
         state.setCurrentAlbum(instance);
         state.setCurrentLoadedAlbum(instance);
         information.update(instance);
      }
   });
   this.addListener("dblclick", function () {
      //TODO this is problematique. it gets fired when a new album is added
      //but the ui is still disabled at that moment
      if (!main.getUI().isDisabled()) {
         instance.openURL();
      }
   });
};

Album.prototype.openURL = function () {
   window.location.href = '/album/view/' + this.secret + '-' + this.id;
};

Album.prototype.checkIconStatus = function () {
   this.showVisitedIcon();
};
