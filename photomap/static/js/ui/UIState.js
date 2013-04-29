/*jslint */
/*global $, window, main, PAGE_MAPPING, DASHBOARD_VIEW, ALBUM_VIEW, String */

"use strict";

/**
 * @author Frederik Claus
 * @class UIState holds the current state of the application
 */


define(["dojo/_base/declare", "util/ClientState", "dojo/domReady"], 
      function (declare, clientstate) {
         var UIState = declare(null, {
            constructor : function () {
               this._NS = "UIState";
               this.currentPhoto = null;
               this.currentLoadedPhoto = null;
               this.currentPlace = null;
               this.currentLoadedPlace = null;
               this.currentAlbum = null;
               this.currentLoadedAlbum = null;
               this.places = [];
               this.albums = [];
               this.markers = [];
               this.albumLoaded = false;
               this.fontSize = null;
               this.fullscreen = null;
               //PAGE_MAPPING is defined in constants.js
               this.page = window.location.pathname;
               this.data = {};
            },
            //--------------------------------------------------------------------
            //MARKER--------------------------------------------------------------
            //--------------------------------------------------------------------
            setMarkers : function (markers) {
               this.markers = markers;
            },
            getMarkers : function () {
               return this.markers;
            },
            insertMarker : function (marker) {
               this.markers.push(marker);
            },
            getMarker : function (model) {
               return this.markers.filter(function (marker, index) {
                  return marker.getModel() === model;
               })[0];
            },
            deleteMarker : function (marker) {
               
               this.markers = this.markers.filter(function (element, index) {
                  return element !== marker;
               });
            },
            //--------------------------------------------------------------------
            //PHOTO---------------------------------------------------------------
            //--------------------------------------------------------------------
            setPhotos : function (photos) {
               //TODO don't hold another reference to the photos array
               // instead return from current Place
               throw new Error("DoNotUseThisError");
            },
            getPhotos : function () {
               if (this.getCurrentLoadedPlace() !== null){
                  return this.getCurrentLoadedPlace().photos;
               }
            },
            setCurrentLoadedPhotoIndex : function (index) {
               this.currentLoadedIndex = index;
            },
            getCurrentLoadedPhotoIndex : function () {
               return this.currentLoadedIndex;
            },
            setCurrentPhoto : function (photo) {
               this.currentPhoto = photo;
            },
            setCurrentLoadedPhoto : function (photo) {
               this.currentLoadedPhoto = photo;
            },
            getCurrentPhoto : function () {
               return this.currentPhoto;
            },
            getCurrentLoadedPhoto : function () {
               return this.currentLoadedPhoto;
            },
            insertPhoto : function (photo) {
               //TODO photos are inserted twice. Once in the place which uses setPhotos and then again her
               // @see deletePhoto()
               throw new Error("DoNotUseThisError");
         
            },
            deletePhoto : function (photo) {
               //TODO it is not our job to keep track of the photos. Place should do that instead
               throw new Error("DoNotUseThisError");
            },
            //--------------------------------------------------------------------
            //PLACE---------------------------------------------------------------
            //--------------------------------------------------------------------
            getPlaces : function () {
               return this.places;
            },
            setPlaces : function (places) {
               this.places = places;
            },
            setCurrentPlace : function (place) {
               this.currentPlace = place;
            },
            getCurrentPlace : function () {
               return this.currentPlace;
            },
            //TODO what was activate used for?
            setCurrentLoadedPlace : function (place) {
               if (this.currentLoadedPlace) {
                  //this.currentLoadedPlace.deactivate();
               }
               this.currentLoadedPlace = place;
               //this.currentLoadedPlace.activate();
            },
            getCurrentLoadedPlace : function () {
               return this.currentLoadedPlace;
            },
            insertPlace : function (place) {
               this.places.push(place);
            },
            deletePlace : function (place) {
               
               this.places = this.places.filter(function (element, index) {
                  return element !== place;
               });
            },
            //--------------------------------------------------------------------
            //ALBUM---------------------------------------------------------------
            //--------------------------------------------------------------------
            setAlbums : function (albums) {
               this.albums = albums;
            },
            getAlbums : function () {
               return this.albums;
            },
            setCurrentAlbum : function (album) {
               this.currentAlbum = album;
            },
            getCurrentAlbum : function () {
               return this.currentAlbum;
            },
            setCurrentLoadedAlbum : function (album) {
               this.currentLoadedAlbum = album;
            },
            getCurrentLoadedAlbum : function () {
               return this.currentLoadedAlbum;
            },
            insertAlbum : function (album) {
               this.albums.push(album);
            },
            deleteAlbum : function (album) {
               this.albums = this.albums.filter(function (element, index) {
                  return element !== album;
               });
            },
            isDashboardView : function () {
               if (this.page.search(DASHBOARD_VIEW) !== -1) {
                  return true;
               } else {
                  return false;
               }
            },
            isAlbumView : function () {
               if (this.page.search(ALBUM_VIEW) !== -1) {
                  return true;
               } else {
                  return false;
               }
            },
            //--------------------------------------------------------------------
            //UI------------------------------------------------------------------
            //--------------------------------------------------------------------
         
            setSlideshowLoaded : function (bool) {
               this.slideshowLoaded = bool;
            },
            isSlideshowLoaded : function (bool) {
               return this.slideshowLoaded;
            },
            setAlbumLoading: function (bool) {
               this.albumLoaded = bool;
            },
            isAlbumLoading : function (bool) {
               return this.albumLoaded;
            },
            // not used right now, but maybe worth being used!
            setFontSize : function (size) {
               this.fontSize = size;
            },
            getFontSize: function () {
               return this.fontSize;
            },
            setFullscreen : function (bool) {
               this.fullscreen = bool;
            },
            isFullscreen : function (bool) {
               return this.fullscreen;
            },
            //TODO clientstate should be accessed in a static way, for some reason this doesn't work in UIState, yet: cuz clientstate is not loaded!?!
            getDialogAutoClose : function () {

               console.log("UIState - getDialogAutoClose: ");
               console.log(clientstate);
               console.log(main.getClientState());
               if (this.dialogAutoClose === undefined){
                  this.dialogAutoClose = main.getClientState().read(this._NS, "dialogAutoClose", false);
               }
               return this.dialogAutoClose;
            },
            //TODO clientstate should be accessed in a static way, for some reason this doesn't work in UIState, yet: cuz clientstate is not loaded!?!
            setDialogAutoClose : function (autoClose) {
               this.dialogAutoClose = autoClose;
               main.getClientState().write(this._NS, "dialogAutoClose", autoClose);
            },
            //TODO clientstate should be accessed in a static way, for some reason this doesn't work in UIState, yet: cuz clientstate is not loaded!?!
            _save : function () {
               main.getClientState().writeCookie(this._COOKIE_KEY, {
                  dialogAutoClose : this.dialogAutoClose
               });
            },
            /**
             * @description Provides a simple method to store variables temporarily
             * @param {String} key
             * @param value
             */
            store : function (key, value) {
               this.data[key] = value;
            },
            /**
             * @description Counterpart for @reference{store}. Retrieves a value
             * @param {String} key
             */
            retrieve : function (key) {
               return this.data[key];
            },
            removeKey: function (key) {
               delete this.data[key];
               return;
            }
         }),
         
         _instance = new UIState();
         return _instance;
      });
   
