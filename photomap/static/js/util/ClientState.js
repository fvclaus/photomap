/*jslint */
/*global $, main */

"use strict";

/**
 * @author Frederik Claus
 */

var ClientState;

ClientState = function () {
   
   var value = $.cookie("visited") || "";

   this._parseValue(value);
   this._year = 356 * 24 * 60 * 60 * 1000;
   this._cookieSettings = {
      expires : new Date().add({years : 1}),
      maxAge : this._year
   };
   this.usedSpace = null;
   this.quota = null;
};

/**
 * @author Marc-Leon Römer
 * @description Defines methods to check whether user is admin or not and reads/writes cookies, describing the state of the client (visited photos, storage-space left, ...)
 */

ClientState.prototype = {
   
   initAfterAjax : function () {
      this.quota = main.getUI().getTools().bytesToMbyte($.cookie("quota"));
      this.updateUsedSpace();
   },
   /**
    * @description Checks if user is owner of the current album (just used in albumview).
    */
   isAdmin : function () {
      var album = main.getUIState().getCurrentLoadedAlbum();
      return album.isOwner;
   },
   /**
    * @description Checks if User is owner of the given album.
    * @param album Album Object.
    */
   isOwner : function (album) {
      return album.isOwner;
   },
   /**
    * @description Takes current cookie, checks it for non-integer values, and rewrites cookie with just integer values.
    * @param {String} value The value of the current cookie or new String if there is no current cookie.
    */
   _parseValue : function (value) {
      
      var oldValue, i, instance = this;
      
      oldValue  = value.split(",");
      this.photos = [];
      
      // 'visited'-cookie mustn't contain non-numeric values!
      if (value !== "") {
         for (i = 0; i < oldValue.length; i++) {
            // in case there is a non-numeric value in the cookie
            if (!isNaN(oldValue[i])) {
               this.photos.push(parseInt(oldValue[i], 10));
            }
         }
         // rewrite cookie, just in case there was a change
         this._writePhotoCookie();
      }
   },
   isVisitedPhoto : function (id) {
      var index = this.photos.indexOf(id);
      if (index === -1) {
         return false;
      }
      return true;
   },
   addPhoto : function (id) {
      if (this.photos.indexOf(id) === -1) {
         this.photos.push(id);
         this._writePhotoCookie();
      }
   },
   _writePhotoCookie : function () {
      this.value = this.photos.join(",");
      $.cookie("visited", this.value, this._cookieSettings);
   },
   getUsedSpace : function () {
      return this.usedSpace;
   },
   getQuota : function () {
      return this.quota;
   },
   updateUsedSpace : function () {
      
      this.usedSpace =  main.getUI().getTools().bytesToMbyte($.cookie("used_space"));
      main.getUI().getInformation().updateUsedSpace();
   }
};
