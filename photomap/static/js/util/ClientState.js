/*jslint */
/*global $, main, define */

"use strict";

/**
 * @author Marc-Leon Römer
 * @description Defines methods to check whether user is admin or not and reads/writes cookies, describing the state of the client (visited photos, storage-space left, ...)
 */

define(["dojo/_base/declare", "util/Communicator", "util/Tools", "ui/UIState"], 
       function (declare, communicator, tools, state) {
          var ClientState = declare(null,  {
             constructor : function () {
                var value = $.cookie("visited") || "";

                this._parseValue(value);
                this._year = 356 * 24 * 60 * 60 * 1000;
                this._cookieSettings = {
                   expires : new Date().add({years : 1}),
                   maxAge : this._year
                };
                this.usedSpace = null;
                this.quota = null;
                
                
                console.log("#####################################");
                console.log(state);
                communicator.subscribeOnce("init", this._init, this);
             },
             /**
              * @description Checks if user is owner of the current album (just used in albumview).
              */
             isAdmin : function () {
                return state.getAlbum().isOwner();
             },
             /**
              * @description Checks if User is owner of the given album.
              * @param album Album Object.
              */
             isOwner : function (album) {
                return album.isOwner;
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
             getUsedSpace : function () {
                return this.usedSpace;
             },
             getQuota : function () {
                return this.quota;
             },
             updateUsedSpace : function () {
                
                var instance = this;
                this.usedSpace =  tools.bytesToMbyte($.cookie("used_space"));
                communicator.publish("change:usedSpace", {
                   used: instance.usedSpace,
                   total: instance.quota
                });
             },
             write : function (ns, key, value) {
                var data = $.cookie(ns);

                if (data === null) {
                   console.log("Ns %s does not exist. Creating a new one", ns);
                   data = {};
                }

                data[key] = value;

                try {
                   data = JSON.stringify(data);
                } catch (stringifyError) {
                   console.log("Could not stringify value %s. Received error %s.", value, stringifyError.toString());
                   return;
                }
                
                console.log("Storing value %s in key %s in ns %s", value, key, ns);
                $.cookie(ns, data, this._cookieSettings);
             },
             read : function (ns, key, defaultValue) {
                var data = $.cookie(ns);
                
                try {
                   data = JSON.parse(data);
                } catch (parseError) {
                   console.log("Ns %s seems to have invalid data %s.", ns, data);
                   return defaultValue;
                }
                
                if (data === null) {
                   console.log("Ns %s does not exist returing defaultValue %s", ns, defaultValue);
                   return defaultValue;
                }
                
                if (data[key] !== undefined) {
                   return data[key];
                } else {
                   return defaultValue;
                }
             },
             _init : function () {
                this.quota = tools.bytesToMbyte($.cookie("quota"));
                this.updateUsedSpace();
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
             _writePhotoCookie : function () {
                this.value = this.photos.join(",");
                $.cookie("visited", this.value, this._cookieSettings);
             }
          }),
          
          _instance = new ClientState();
          return _instance;
       });
