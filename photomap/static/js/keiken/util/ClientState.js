/*jslint */
/*global $, main, define */

"use strict";

/**
 * @author Marc-Leon Römer
 * @description Defines methods to check whether user is admin or not and reads/writes cookies, describing the state of the client (visited photos, storage-space left, ...)
 */

define(["dojo/_base/declare",
        "dojo/date",
        "./Communicator",
        "./Tools"],
       function (declare, date, communicator, tools) {
      var ClientState = declare(null,  {
         constructor : function () {
            this.visitedCookie = $.cookie("visited") || "";
            this.visitedPhotos = [];
            this._parseValue(this.visitedCookie);
            
            this._year = 356 * 24 * 60 * 60 * 1000;
            this._expirationDate = date.add(new Date(), "year", 1);
            this._cookieSettings = {
               expires : this._expirationDate,
               maxAge : this._year
            };
            this.usedSpace = null;
            this.quota = null;
         },
         
         getDialogAutoClose : function () {
            return this.read("DialogMessage", "dialogAutoClose", false);
         },
         setDialogAutoClose : function (autoClose) {
            this.write("DialogMessage", "dialogAutoClose", autoClose);
         },
         isVisitedPhoto : function (photo) {
            if (this.visitedPhotos.indexOf(photo.id) === -1) {
               return false;
            }
            return true;
         },
         insertVisitedPhoto : function (photo) {
            if (this.visitedPhotos.indexOf(photo.id) === -1) {
               this.visitedPhotos.push(photo.id);
               this._writePhotoCookie();
            }
         },
         init : function () {
            this.quota = tools.bytesToMbyte($.cookie("quota"));
            this.updateUsedSpace();
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
         /**
          * @description Takes current cookie, checks it for non-integer values, and rewrites cookie with just integer values.
          * @param {String} value The value of the current cookie or new String if there is no current cookie.
          */
         _parseValue : function (value) {
            
            var oldValue = value.split(","),
               i,
               instance = this;
            
            this.visitedPhotos = [];
            
            // 'visited'-cookie mustn't contain non-numeric values!
            if (value !== "") {
               for (i = oldValue.length; i >= 0; --i) {
                  // in case there is a non-numeric value in the cookie
                  if (!isNaN(oldValue[i])) {
                     this.visitedPhotos.push(parseInt(oldValue[i], 10));
                  }
               }
               //this.visitedPhotos.reverse(); // this is not really needed, since it doesn't matter in which order the photo-ids are
               // rewrite cookie, just in case there was a change
               this._writePhotoCookie();
                }
         },
         _writePhotoCookie : function () {
            $.cookie("visited", this.visitedPhotos.join(","), this._cookieSettings);
            this.visitedCookie = $.cookie("visited") || "";
         }
      }),
          
         _instance = new ClientState();
      return _instance;
   });
