/*jslint */
/*global $, main, Place */

"use strict";

/**
 * @author Frederik Claus
 * @class ClientServer handles interactions between client and server
 */
var ClientServer;

ClientServer = function () {
   // array of places
   this.uploadedPhotos = [];
};

/**
 * @author Marc-Leon Römer
 * @description Gets current album, defines handler for saving photo-order and deleting photos & places
 */

ClientServer.prototype = {
   init : function () {
      // make an AJAX call to get the places from the XML file, and display them on the Map
      this._getPlaces();
   },
   savePhotoOrder : function (photos) {
      
      var place;
      
      photos.forEach(function (photo) {
         // post request for each photo with updated order
         $.ajax({
            url : "/update-photo",
            type : "post",
            data : {
               id : photo.id,
               title : photo.title,
               order : photo.order
            },
            success : function () {
               place = main.getUIState().getCurrentLoadedPlace();
               console.log("Success");
               place.sortPhotos();
               main.getUI().getGallery().setGalleryChanged(true);
            },
            error : function (jqXHR, textStatus, errorThrown) {
               alert("Status: " + textStatus + " Error: " + errorThrown);
            }
         });
      });
   },
   deleteObject : function (url, data) {
      
      var ui, state;
      state = main.getUIState();
      ui = main.getUI();
      
      $.ajax({
         type : "post",
         dataType : "json",
         "url" : url,
         data : {
            id : data.id
         },
         success : function (response) {
            if (response.error) {
               alert(response.error);
            } else {
               
               switch (data.model) {
                  
               case "Photo":
                  ui.removePhoto(data.id);
                  break;
               case "Place":
                  ui.removePlace(data.id);
                  break;
               default:
                  alert("The deleted Object has no model and therefor couldn't be removed from ui");
                  break;
               }
            }
         },
         error : function (err) {
            alert(err.toString());
         }
      });
   },
   /**
    * @private
    */
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
         "data" : data,
         success: function (albuminfo) {

            var places, place;

            // set current album in UIState to have access on it for information, etc.
            main.getUIState().setCurrentLoadedAlbum(albuminfo);
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
   /**
    * @private
    */
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

         // puts photos with order on the right position
         place.sortPhotos();
      });

      return places;
   }
};
