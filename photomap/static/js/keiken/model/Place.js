/*jslint */
/*global $, define, main, ZOOM_LEVEL_CENTERED, google  */

"use strict";

/**
 * Place.js
 * @author Frederik Claus
 * @class Place stores several pictures and is itself stored in the map
 */


define(["dojo/_base/declare", 
        "./MarkerModel", 
        "./Photo", 
        "./Collection", 
        "../util/Communicator"],
       function (declare, MarkerModel, Photo, Collection) {
          console.log("Place: start");
          return declare(MarkerModel, {
             constructor : function (data) {
                
                this.type = 'Place';

                this.photos = null;
                if (data.photos) {
                   var photos = [];
                   //TODO remove Listener and replace this.photoCollection with this.photos (@see Place.js) when gallery, slideshow, ... support photoCollections
                   $.each(data.photos, function (index, photoData) {
                      photos.push(new Photo(photoData));
                   });
                   this.photos = new Collection(photos, {
                      modelType: "Photo",
                      modelConstructor: Photo,
                      orderBy: "order"
                   });
                }
             },
             /**
              * @description Get a photo by src
              * @returns {Photo}  Photo with src present, else null
              */
             getPhoto : function (src) {
                return this.photoCollection.getByAttribute("photo", src);
             },
             //TODO return photoCollection once Collections are implemented
             getPhotos : function ()   {
                return this.photos.getAll();
             },
             //TODO remove once Collections are implemented
             getPhotoCollection : function ()   {
                return this.photos;
             }
          });
       });
   