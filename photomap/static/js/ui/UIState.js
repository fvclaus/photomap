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
               this.hoveredMarker = null;
               this.currentMarker = null;
               this.currentMarkerIndex = -1;
               this.currentLoadedMarker = null;
               this.currentLoadedMarkerIndex = -1;
               this.places = [];
               this.albums = [];
               this.markers = [];
               this.albumLoaded = false;
               this.fontSize = null;
               this.fullscreen = null;
               //PAGE_MAPPING is defined in constants.js
               this.page = window.location.pathname;
               this.data = {};
               
               // store album (model) in albumview
               if (this.isAlbumView()) {
                  this.album = null;
               }
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
            /**
             * @param marker {Integer/Object} Can be either the index of the marker or the model of the marker!
             */
            getMarker : function (marker) {
               
               if (typeof marker === "number") {
                  return this.markers[marker];
               }
               
               return this.markers.filter(function (markerPresenter, index) {
                  return markerPresenter.getModel() === marker;
               })[0];
            },
            deleteMarker : function (marker) {
               
               this.markers = this.markers.filter(function (element, index) {
                  return element !== marker;
               });
            },
            setHoveredMarker : function (marker) {
               this.hoveredMarker = marker;
            },
            getHoveredMarker : function () {
               return this.currentMarker;
            },
            setCurrentMarker : function (marker) {
               this.currentMarker = marker;
               this.currentMarkerIndex = $(this.markers).index(marker);
            },
            getCurrentMarker : function () {
               return this.currentMarker;
            },
            getCurrentMarkerIndex: function () {
               return this.currentMarkerIndex;
            },
            setCurrentLoadedMarker : function (marker) {
               this.currentLoadedMarker = marker;
               this.currentLoadedMarkerIndex = $(this.markers).index(marker);
            },
            getCurrentLoadedMarker : function () {
               return this.currentLoadedMarker;
            },
            getCurrentLoadedMarkerIndex: function () {
               return this.currentLoadedMarkerIndex;
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
                  return this.getCurrentLoadedPlace().getModel().getPhotos();
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
               return this.getMarkers();
            },
            setPlaces : function (places) {
               this.setMarkers(places);
            },
            setCurrentPlace : function (place) {
               this.setCurrentMarker(place);
            },
            getCurrentPlace : function () {
               return this.getCurrentMarker();
            },
            setCurrentLoadedPlace : function (place) {
               this.setCurrentLoadedMarker(place);
            },
            getCurrentLoadedPlace : function () {
               return this.getCurrentLoadedMarker();
            },
            insertPlace : function (place) {
               this.insertMarker(place);
            },
            deletePlace : function (place) {
               this.deleteMarker(place);
            },
            //--------------------------------------------------------------------
            //ALBUM---------------------------------------------------------------
            //--------------------------------------------------------------------
            setAlbum : function (album) {
               this.album = album;
            },
            getAlbum : function () {
               return this.album;
            },
            setAlbums : function (albums) {
               this.setMarkers(albums);
            },
            getAlbums : function () {
               return this.getMarkers();
            },
            setCurrentAlbum : function (album) {
               this.setCurrentMarker(album);
            },
            getCurrentAlbum : function () {
               return this.getCurrentMarker();
            },
            setCurrentLoadedAlbum : function (album) {
               this.setCurrentLoadedMarker(album);
            },
            getCurrentLoadedAlbum : function () {
               return this.getCurrentLoadedMarker();
            },
            insertAlbum : function (album) {
               this.insertMarker(album);
            },
            deleteAlbum : function (album) {
               this.deleteMarker(album);
            },
            //--------------------------------------------------------------------
            //UI------------------------------------------------------------------
            //--------------------------------------------------------------------
            isDashboardView : function () {
               if (this.page.search(DASHBOARD_VIEW) !== -1) {
                  return true;
               }
               return false;
            },
            isAlbumView : function () {
               if (this.page.search(ALBUM_VIEW) !== -1) {
                  return true;
               }
               return false;
            },
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
   
