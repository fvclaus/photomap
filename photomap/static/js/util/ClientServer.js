/*jslint */
/*global $, main, Album, Place */

"use strict";

/**
 * @author Frederik Claus
 * @class ClientServer handles interactions between client and server
 */

var ClientServer;

ClientServer = function () {
   // array of albums
   this.albums = [];
};

/**
 * @author Marc-Leon Römer
 * @description Gets all albums of user, defines handler to get share-link and delete albums
 */

ClientServer.prototype = {
   init : function () {
      if (main.getUIState().isAlbumView()){
         this._getPlaces();
      }
      else{
         this._getAlbums();

      }
   },
   /**
    * @private
    */
   _getAlbums : function () {
      var instance = this;
      // get the albums and their info
      $.ajax({
         "url" : 'get-all-albums',
         success :  function (albumsinfo) {
            
            var map, album;
            map = main.getMap();

            // in case there are no albums yet show world map
            if (albumsinfo.length === 0) {
               map.showWorld();
               main.initAfterAjax();
               return;
            }

            albumsinfo.forEach(function (albuminfo) {
               album = new Album(albuminfo);
               instance.albums.push(album);
            });

            main.getUIState().setAlbums(instance.albums);

            instance._showAlbums(instance.albums);

         }
      });
   },
   /**
    * @private
    */
   _showAlbums : function (albums) {
      var map = main.getMap();
      map.showAsMarker(albums);
      
      main.initAfterAjax();
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
