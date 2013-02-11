/*jslint */
/*global $, window, main, PAGE_MAPPING, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

/**
 * @author Frederik Claus
 * @class UIState holds the current state of the application
 */

var UIState;

UIState = function () {
   this.currentPhoto = null;
   this.currentLoadedPhoto = null;
   this.currentPlace = null;
   this.currentLoadedPlace = null;
   this.currentAlbum = null;
   this.currentLoadedAlbum = null;
   this.photos = [];
   this.places = [];
   this.albums = [];
   this.albumLoaded = false;
   this.fontSize = null;
   this.fullscreen = null;
   this.dialogAutoClose = false;
   //PAGE_MAPPING is defined in constants.js
   this.page = PAGE_MAPPING[window.location.pathname];
   this.data = {};
};

UIState.prototype = {
   //--------------------------------------------------------------------
   //PHOTO---------------------------------------------------------------
   //--------------------------------------------------------------------
   setPhotos : function (photos) {
      //TODO someone sets photos to null
      if (photos === null) {
         return;
      }
      this.photos = photos;
   },
   getPhotos : function () {
      return this.photos;
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
      this.photos.push(photo);
   },
   deletePhoto : function (photo) {
      this.photos = this.photos.filter(function (element, index) {
         return element !== photo;
      });
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
   setCurrentLoadedPlace : function (place) {
      this.currentLoadedPlace = place;
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
      return this.page === DASHBOARD_VIEW;
   },
   isAlbumView : function () {
      return this.page === ALBUM_VIEW;
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

   getDialogAutoClose : function () {
      return this.dialogAutoClose;
   },
   setDialogAutoClose : function (autoClose) {
      this.dialogAutoClose = autoClose;
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
};
