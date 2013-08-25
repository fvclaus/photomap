/*jslint */
/*global $, window, main, define, assertTrue, String, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

/**
 * @author Frederik Claus
 * @class UIState holds the current state of the application
 */


define(["dojo/_base/declare",
        "../util/ClientState",
        "dojo/domReady"],
   function (declare, clientstate) {
      var UIState = declare(null, {
         constructor : function () {
            this._NS = "UIState";
            this.album = null; // in albumview this refers to the loaded album
            this.albums = null; // in dashboardview this is the collection of all albums
            //PAGE_MAPPING is defined in constants.js
            this.page = window.location.pathname;
            this.data = {};
         },
         setAlbum : function (album) {
            this.album = album;
         },
         getAlbum : function () {
            assertTrue(this.isAlbumView(), "getAlbum is used to get currently loaded album in albumview");
            return this.album;
         },
         setAlbums : function (collection) {
            this.albums = collection;
         },
         getAlbums : function () {
            return this.albums;
         },
         getPlaces : function () {
            assertTrue(this.album, "there is no album loaded");
            return this.album.getPlaces();
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

