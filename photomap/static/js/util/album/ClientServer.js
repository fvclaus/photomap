/*jslint */
/*global $, main, Place, arrayExtension */

"use strict";

var ClientServer;

ClientServer = function () {
   // array of places
   this.uploadedPhotos = [];
};

ClientServer.prototype = {
   init : function () {
      // make an AJAX call to get the places from the XML file, and display them on the Map
      this._getPlaces();
   },
   savePhotoOrder : function (photos) {
      photos.forEach(function (photo) {
         // post request for each photo with updated order
         $.ajax({
            url : "/update-photo",
            type : "post",
            data : {
               'id': photo.id,
               'order': photo.order,
            }
         });
      });
   },
   _getPlaces : function () {
      
      var data, tools, id, secret, instance = this;
      tools = main.getUI().getTools();
      data = {
         'id' : tools.getUrlId()
      };
      if (tools.getUrlSecret() !== null) {
         data.secret = tools.getUrlSecret();
      }

      $.ajax({
         "url" : "get-album",
         data : {
            "id" : id,
            "secret" : secret
         },
         success: function (albuminfo) {

            var places, place;

            // set current album in UIState to have access on it for information, etc.
            main.getUIState().setCurrentAlbum(albuminfo);
            // set album title in title-bar
            main.getUI().getInformation().updateAlbumTitle();

            // in case there are no places yet show map around album marker
            if (!albuminfo.places || (albuminfo.places === null) || (albuminfo.places.length === 0)) {
               main.getMap().expandBounds(albuminfo);
               main.initAfterAjax();
               return;
            }

            places = [];

            albuminfo.places.forEach(function (placeinfo) {
               place = new Place(placeinfo);
               places.push(place);
            });
            // add to UIState
            main.getUIState().setPlaces(places);

            instance._showPlaces(places);
         }
      });

   },
   _showPlaces : function (places) {
      var map = main.getMap();

      places = this._sortPhotos(places);
      map.showAsMarker(places);

      main.initAfterAjax();
   },
   /**
    * @private
    */
   _sortPhotos : function (places) {

      places.forEach(function (place) {

         var copy;

         copy = place.photos;
         place.photos = [];

         // puts photos with order on the right position
         copy.forEach(function (photo, index) {
            place.photos[photo.order] = photo;
         });
      });

      return places;
   }
};
