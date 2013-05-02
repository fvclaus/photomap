/*jslint */
/*global $, define, main, ZOOM_LEVEL_CENTERED, google  */

"use strict";

/**
 * Place.js
 * @author Frederik Claus
 * @class Place stores several pictures and is itself stored in the map
 */


define(["dojo/_base/declare", "model/MarkerModel", "model/Photo", "util/Communicator", "ui/UIState"],
       function (declare, MarkerModel, Photo, communicator, state) {
          console.log("Place: start");
          return declare(MarkerModel, {
             constructor : function (data) {
                var i, len;
                
                this.type = 'Place';

                this.photos = [];
                if (data.photos) {
                   for (i = 0, len = data.photos.length; i < len; ++i) {
                      this.photos.push(new Photo(data.photos[i], i));
                   }
                }
             },
             /**
              * @description adds photo and restarts gallery
              */
             insertPhoto : function (photo) {
                if (this.active) {
                   this.photos.push(photo);
                }
             },
             deletePhoto : function (photo) {
                this.photos = this.photos.filter(function (element, index) {
                   return element !== photo;
                });
             },
             sortPhotos : function () {
                // puts photos with order on the right position
                this.photos
                   .sort(function (photo, copy) {
                      return photo.order - copy.order;
                   });
             },
             /**
              * @description Get a photo by src
              * @returns {Photo}  Photo with src present, else null
              */
             getPhoto : function (src) {
                var photo = $.grep(this.photos, function (photo) {
                   return photo.photo === src;
                });
                if (photo.length === 0) {
                   return null;
                } else {
                   return photo[0];
                }
             },
             getPhotos : function ()   {
                return this.photos;
             }
          });
       });
   