/*jslint */
/*global $, gettext, parseInt */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Enables hashdriven routing (to a specific place or photo) for the app (including back and forth).
 * The hash schema is: #/place/id/page/id/photo/id - where page means the current gallery page
 * The ids of place and photo are consecutively set in the backend, the page id is set frontend and starts over in each place
 */

define(["dojo/_base/declare", "dojo/router", "util/Communicator", "ui/UIState", "dojo/ready"], 
      function (declare, router, communicator, state, ready) {
         return declare(null, {
            
            constructor: function () {
               
               /* -------- matcher to get or change a specific part of the hash -------- */
               this.albumMatcher = /(\/album\/)(\d+)(\/)/;
               this.placeMatcher = /(\/place\/)(\d+)(\/)/;
               this.pageMatcher = /(\/page\/)(\d+)(\/)/;
               this.photoMatcher = /(\/photo\/)(\d+)(\/)/;
               
               /* ------ supported hash structures -------- */
               this.defaultHash = /^!\/$/;
               this.albumSelectedHash = /^!\/(album)\/(\d+)\/$/; // album selected
               this.placeSelectedHash = /^!\/(place)\/(\d+)\/$/; // place selected
               this.placeLoadedHash = /^!\/(place)\/(\d+)\/(page)\/(\d+)\/$/; // place opened
               this.photoLoadedHash = /^!\/(place)\/(\d+)\/(page)\/(\d+)\/(photo)\/(\d+)\/$/; // place opened and photo loaded
               
               this.currentHash = "";
               
               /* ----- hash change handles ---- */
               this.albumListener = null;
               this.placeListener = null;
               this.pageListener = null;
               this.photoListener = null;
               
               communicator.subscribeOnce("ready:App", this._start, this);
            },
            _start : function () {
               // register routes
               this._registerHashListener();
               // register App State change requests
               communicator.subscribe({
                  "click:marker": function (marker) {
                     this.goTo(marker.getModel().getType(), marker.getModel().getId()); // select marker (place or album)
                  },
                  //TODO somehow click:marker is triggered right after dblClick was triggered on the marker.. -> hash changes back to "!/place/ID/"
                  "dblClick:place": function (place) {
                     router.go("!/place/" + place.getModel().getId() + "/page/1/"); // open place
                  },
                  "close:detail": function () {
                     if (state.isDashboardView() || !state.getCurrentLoadedMarker()) {
                        this._goToDefault(); // reset state to default
                     } else if (state.getCurrentLoadedMarker()) {
                        //TODO if a place is loaded in AlbumView and then another place is selected and then deselected again (by closing the detail), the hash has to be updated to show current place/page and photo again!
                        //router.go("!/place/" + state.getCurrentLoadedMarker() + "/page/" + CURRENTGALLERYPAGE + "/photo/" + CURRENTPHOTO)
                     }
                  },
                  "click:galleryThumb": function (photo) {
                     this.goTo("photo", photo.getId()); // load photo
                  },
                  //TODO these events have to be published in order for the routing to work properly
                  "click:galleryNav": function (newPageId) {
                     this.goTo("page", newPageId);
                  },
                  "click:slideshowNav": function (newPhoto) {
                     this.goTo("photo", newPhoto.getId());
                  },
                  //TODO depending on how fullscreen and slideshow are connected this event has to be published and the handler 
                  // in AppController must navigate Slideshow as well as Fullscreen
                  "click:fullscreenNav": function (newPhoto) {
                     this.goTo("photo", newPhoto.getId());
                  }
               }, this);
               // start router
               router.startup();
               // start routing by calling router.go on the current hash
               router.go(window.location.hash.substring(1, window.location.hash.length));
            },
            goTo : function (name, id) {
               
               switch (name.toLowerCase()) {
                  case "album":
                     router.go("!/album/" + id + "/");
                     break;
                  case "place":
                     router.go("!/place/" + id + "/");
                     break;
                  case "page":
                     this._goToPage(id);
                     break;
                  case "photo":
                     this._goToPhoto(id);
                     break;
                  default:
                     throw new Error("InvalidHashRequestError");
                     break;
               }
            },
            _goToPage : function (id) {
               
               var newHash;
               
               if (this.pageMatcher.test(this.currentHash)) {
                  newHash = this.currentHash.replace(this.pageMatcher, "$1" + id + "$3");
               } else if (this.placeMatcher.test(this.currentHash)) {
                  newHash = this.currentHash + "page/" + id + "/";
               } else if (this.currentHash === "" || this.defaultHash.test(this.currentHash)){
                  throw new Error("NoPlaceLoadedError");
                  newHash = "!/place/" + id + "/page/1/";
               }
               
               router.go(newHash);
            },
            _goToPhoto : function (id) {
               
               var newHash;
               
               if (this.photoMatcher.test(this.currentHash)) {
                  newHash = this.currentHash.replace(this.photoMatcher, "$1" + id + "$3");
               } else if (this.pageMatcher.test(this.currentHash)) {
                  newHash = this.currentHash + "photo/" + id + "/";
               } else {
                  throw new Error("NoPlaceLoadedError");
               }
               
               router.go(newHash);
            },
            _goToDefault : function () {
               router.go("!/");
            },
            _registerHashListener : function () {
               var instance = this;
               
               router.register(this.defaultHash, function (event) {
                  instance._hashChangeHandler.call(instance, event);
               });
               
               if (state.isDashboardView()) {
                  this.albumListener = router.register(this.albumSelectedHash, function (event) {
                     instance._hashChangeHandler.call(instance, event);
                  });
               } else if (state.isAlbumView()) {
                  this.placeListener = router.register(this.placeSelectedHash, function (event) {
                     instance._hashChangeHandler.call(instance, event);
                  });
                  this.pageListener = router.register(this.placeLoadedHash, function (event) {
                     instance._hashChangeHandler.call(instance, event);
                  });
                  this.photoListener = router.register(this.photoLoadedHash, function (event) {
                     instance._hashChangeHandler.call(instance, event);
                  });
               } else {
                  throw new Error("UnknownPageError");
               }
            },
            _hashChangeHandler : function (event) {
               
               // set current hash
               this.currentHash = event.newPath;
               // publish change
               communicator.publish("change:AppState", this._parseHash(event.params));
            },
            _parseHash : function (hashParams) {
               var newState = {},
                  i = 0,
                  defaultState = {
                     album: null,
                     place: null,
                     page: null,
                     photo: null
                  };
               for (i; i <= hashParams.length; i += 2) {
                  if (i === hashParams.length) {
                     $.extend(this.state, defaultState, newState);
                     break;
                  }
                  newState[hashParams[i]] = parseInt(hashParams[i+1]);
               }
               
               return newState;
            }
//             
            // _getCurrentAlbumHash : function () {
               // if (this.albumMatcher.test(this.currentHash)) {
                  // return this.albumMatcher.exec(this.currentHash);
               // }
               // return null;
            // },
            // _getCurrentPlaceHash : function () {
               // if (this.placeMatcher.test(this.currentHash)) {
                  // return this.placeMatcher.exec(this.currentHash);
               // }
               // return null;
            // },
            // _getCurrentGalleryPageHash : function () {
               // if (this.galleryPageMatcher.test(this.currentHash)) {
                  // return this.galleryPageMatcher.exec(this.currentHash);
               // }
               // return null;
            // },
            // _getCurrentPhotoHash : function () {
               // if (this.photoMatcher.test(this.currentHash)) {
                  // return this.photoMatcher.exec(this.currentHash);
               // }
               // return null;
            // },
            
         });
      });
