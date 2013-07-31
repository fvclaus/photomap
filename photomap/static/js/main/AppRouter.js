/*jslint */
/*global $ */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Enables hashdriven routing (to a specific place or photo) for the app (including back and forth).
 * The hash schema is: #/place/id/page/id/photo/id - where page means the current gallery page
 * The ids of place and photo are consecutively set in the backend, the page id is set frontend and starts over in each place
 */

define(["dojo/_base/declare", "dojo/router", "util/Communicator", "dojo/domReady!"], 
      function (declare, router, communicator) {
         return declare(null, {
            
            constructor: function () {
               
               this.placeHashMatcher = /\/place\/(\d+)\//;
               this.galleryPageHashMatcher = /\/page\/(\d+)\//;
               this.photoHashMatcher = /\/photo\/(\d+)\//;
               
               this.currentHash = null;
               
               //this.albumListener = registerAlbumChangeListener();
               
               this.placeListener = this._registerPlaceChangeListener();
               
               this.galleryPageListener = this._registerGalleryPageChangeListener();
               
               this.photoListener = this._registerPhotoChangeListener();
               
               router.startup();
            },
            goToPlace : function (id) {
               var oldPlaceHash = this._getCurrentPlaceHash() || ["/place/0/"];
               
               router.go(oldPlaceHash[0].replace(/\d+/, id));
            },
            goToGalleryPage : function (id) {
               var oldGalleryPageHash = this._getCurrentGalleryPageHash() || ["/page/0/"];
               
               if (this._getCurrentPlaceHash()) {
                  router.go(this._getCurrentPlaceHash()[0] + oldGalleryPageHash[0].replace(/\d+/, id));
               } else {
                  alert("You cannot select a gallery page without selecting a place first.");
               }
            },
            goToPhoto : function (id) {
               var oldPhotoHash = this._getCurrentPhotoHash() || ["/photo/0/"];
               
               if (this._getCurrentPlaceHash() && this._getCurrentGalleryPageHash()) {
                  router.go(this._getCurrentPlaceHash()[0] + this._getCurrentGalleryPageHash()[0] + oldPhotoHash[0].replace(/\d+/, id));
               } else {
                  alert("You cannot select a photo without selecting a place or gallery page first.");
               }
            },
            _getCurrentPlaceHash : function () {
               if (this.placeHashMatcher.test(this.currentHash)) {
                  return this.placeHashMatcher.exec(this.currentHash);
               }
               return null;
            },
            _getCurrentGalleryPageHash : function () {
               if (this.galleryPageHashMatcher.test(this.currentHash)) {
                  return this.galleryPageHashMatcher.exec(this.currentHash);
               }
               return null;
            },
            _getCurrentPhotoHash : function () {
               if (this.photoHashMatcher.test(this.currentHash)) {
                  return this.photoHashMatcher.exec(this.currentHash);
               }
               return null;
            },
            /**
             * @private
             */
            _registerPlaceChangeListener: function () {
               return router.register();
            },
            /**
             * @private
             */
            _registerGalleryPageChangeListener : function () {
               
            },
            /**
             * @private
             */
            _registerPhotoChangeListener: function () {
               return router.register();
            },
            
         });
      });
