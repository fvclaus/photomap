/*jslint */
/*global $, main, Album, Place, Photo, gettext, window, assert, assertTrue, assertFalse, assertNumber, assertString */

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
   preinit : function () {
      assertTrue(main.getUIState().isAlbumView() || main.getUIState().isDashboardView());
      
      if (main.getUIState().isAlbumView()) {
         this._getPlaces();
      } else if (main.getUIState().isDashboardView()) {
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
               main.init();
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
      
      main.init();
   },

   /**
    * @private
    */
   _getPlaces : function () {
      
      var idFromUrl = /-(\d+)$/,
          data = {
             "id" : idFromUrl.exec(window.location.pathname)[1]
          }, 
          tools = main.getUI().getTools(),  
          instance = this;

      $.ajax({
         "url" : "/get-album",
         "data" : data,
         success: function (albuminfo) {

            if (albuminfo.success) {
               var places, place,
                   album = new Album(albuminfo);
               
               // set current album in UIState to have access on it for information, etc.
               main.getUIState().setCurrentLoadedAlbum(album);
               // show album title in panel
               $(".mp-page-title h1").text(album.title);
               // set album title & description
               main.getUI().getInformation().update(album);


               // in case there are no places yet show map around album marker
               if (!albuminfo.places || (albuminfo.places === null) || (albuminfo.places.length === 0)) {
                  main.getMap().expandBounds(album);
                  main.init();
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
            } else {
               alert(gettext("GET_ALBUM_ERROR") + albuminfo.error);
            }
         },
         error : function () {
            alert(gettext("NETWORK_ERROR"));
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

      main.init();
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
