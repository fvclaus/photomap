/*jslint */
/*global $, gettext, parseInt */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Enables hashdriven routing (to a specific place or photo) for the app (including back and forth).
 * The hash schema is: #/place/id/page/id/photo/id - where page means the current gallery page
 * The ids of place and photo are consecutively set in the backend, the page id is set frontend and starts over in each place
 */

define(["dojo/_base/declare", "dojo/router", "util/Communicator", "ui/UIState", "util/InfoText", "dojo/ready"], 
      function (declare, router, communicator, state, InfoText, ready) {
         return declare(null, {
            
            constructor: function () {
               
               /* -------- matcher to get or change a specific part of the hash -------- */
               this.albumMatcher = /(\/album\/)(\d+)(\/)/;
               this.placeMatcher = /(\/place\/)(\d+)(\/)/;
               this.galleryPageMatcher = /(\/page\/)(\d+)(\/)/;
               this.photoMatcher = /(\/photo\/)(\d+)(\/)/;
               
               /* ------ supported hash structures -------- */
               this.albumSelectedHash = /^!\/(album)\/(\d+)\/$/;
               this.placeSelectedHash = /^!\/(place)\/(\d+)\/$/;
               this.placeLoadedHash = /^!\/(place)\/(\d+)\/(page)\/(\d+)\/$/;
               this.photoLoadedHash = /^!\/(place)\/(\d+)\/(page)\/(\d+)\/(photo)\/(\d+)\/$/;
               
               this.currentHash = "";
               this.state = {
                  album: null,
                  place: null,
                  page: null,
                  photo: null
               }
               
               /* ----- hash change handles ---- */
               this.albumListener = null;
               this.placeListener = null;
               this.pageListener = null;
               this.photoListener = null;
               
               this.infoText = new InfoText();
               
               communicator.subscribeOnce("ready:App", this.start, this);
            },
            start : function () {
               this._registerHashListener();
               router.startup();
               router.go(window.location.hash.substring(1, window.location.hash.length));
            },
            goTo : function (name, id) {
               
               if (!name) {
                  this._emptyHash();
                  return;
               }
               
               switch (name.toLowerCase()) {
                  case "album":
                     this.goToAlbum(id);
                     break;
                  case "place":
                     this.goToPlace(id);
                     break;
                  case "page":
                     this.goToPage(id);
                     break;
                  case "photo":
                     this.goToPhoto(id);
                     break;
                  default:
                     throw new Error("InvalidHashRequestError");
                     break;
               }
            },
            goToAlbum : function (id) {
               
               var newHash;
               
               if (this.albumMatcher.test(this.currentHash)) {
                  newHash = this.currentHash.replace(this.albumMatcher, "$1" + id + "$3");
               } else {
                  newHash = "!/album/" + id + "/";
               }
               
               router.go(newHash);
            },
            goToPlace : function (id) {
               
               var newHash;
               
               if (this.placeMatcher.test(this.currentHash)) {
                  newHash = this.currentHash.replace(this.placeMatcher, "$1" + id + "$3");
               } else {
                  newHash = "!/place/" + id + "/";
               }
               
               router.go(newHash);
            },
            goToPage : function (id) {
               
               var newHash;
               
               if (this.pageMatcher.test(this.currentHash)) {
                  newHash = this.currentHash.replace(this.pageMatcher, "$1" + id + "$3");
               } else if (this.placeMatcher.test(this.currentHash)) {
                  newHash = this.currentHash + "page/" + id + "/";
               } else {
                  throw new Error("NoPlaceLoadedError");
               }
               
               router.go(newHash);
            },
            goToPhoto : function (id) {
               
               var newHash;
               
               if (this.photoMatcher.test(this.currentHash)) {
                  newHash = this.currentHash.replace(this.photoMatcher, "$1" + id + "$3");
               } else if (this.pageMatcher.test(this.currentHash)) {
                  newHash = this.currentHash + "page/" + id + "/";
               } else {
                  throw new Error("NoPlaceLoadedError");
               }
               
               router.go(newHash);
            },
            _emptyHash : function () {
               router.go("!/");
            },
            _registerHashListener : function () {
               var instance = this;
               
               router.register("!/", function (event) {
                  instance._updateState([]);
                  communicator.publish("change:AppState", instance.state);
               });
               
               if (state.isDashboardView()) {
                  this.albumListener = router.register(this.albumSelectedHash, function (event) {
                     instance._markerChangeHandler.call(instance, event);
                  });
               } else if (state.isAlbumView()) {
                  this.placeListener = router.register(this.placeSelectedHash, function (event) {
                     instance._markerChangeHandler.call(instance, event);
                  });
                  this.pageListener = router.register(this.placeLoadedHash, function (event) {
                     instance._pageChangeHandler.call(instance, event);
                  });
                  this.photoListener = router.register(this.photoLoadedHash, function (event) {
                     instance._photoChangeHandler.call(instance, event);
                  });
               } else {
                  throw new Error("UnknownPageError");
               }
            },
            _markerChangeHandler : function (event) {
               
               var type = event.params[0],
                  infoMessage = "INVALID_" + type.toUpperCase();
               // set current hash and update state
               this.currentHash = event.newPath;
               this._updateState(event.params);
               // check if model exists
               console.log(type);
               console.log(state.getCollection(type).has(this.state[type]));
               if (state.getCollection(type).has(this.state[type])) {
                  communicator.publish("change:AppState", this.state);
               } else {
                  this.infoText.alert(gettext(infoMessage));
               }
            },
            _pageChangeHandler : function (event) {
               
               var type = event.params[0], place, instance = this;
               // set current hash and update state
               this.currentHash = event.newPath;
               this._updateState(event.params);
               if (state.getCollection("Place").has(this.state.place)) {
                  // get Presenter of the current place
                  place = state.getMarker(state.getCollection("Place").get(this.state.place));
                  communicator.subscribeOnce("opened:place", function () {
                     if (main.getUI().getGallery().hasPage(instance.state.page)) {
                        communicator.publish("change:AppState", instance.state);
                     } else {
                        this.infoText.alert(gettext("INVALID_PAGE"));
                     }
                  });
                  place.open();
               } else {
                  this.infoText.alert(gettext("INVALID_PLACE"));
               }
            },
            _photoChangeHandler : function (event) {
               
               var type = event.params[0];
               /// set current hash and update state
               this.currentHash = event.newPath;
               this._updateState(event.params);
               if (state.getCollection("Place").has(this.state.place)) {
                  // get Presenter of the current place
                  place = state.getMarker(state.getCollection("Place").get(this.state.place));
                  communicator.subscribeOnce("opened:place", function () {
                     if (state.getCollection("Photo").has(instance.state.photo)) {
                        if (main.getUI().getGallery().hasPage(instance.state.page)) {
                           this.infoText.alert(gettext("INVALID_PAGE"));
                        }
                        communicator.publish("change:AppState", instance.state);
                     } else {
                        if (main.getUI().getGallery().hasPage(instance.state.page)) {
                           this.infoText.alert(gettext("INVALID_PHOTO_AND_PAGE"));
                        } else {
                           this.infoText.alert(gettext("INVALID_PHOTO"));
                        }
                     }
                  });
                  place.open();
               } else {
                  this.infoText.alert(gettext("INVALID_PLACE"));
               }
            },
            _updateState : function (hashParams) {
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
