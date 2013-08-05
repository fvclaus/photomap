/*jslint */
/*global $, define, main, ZOOM_LEVEL_CENTERED, google  */

"use strict";

/**
 * Place.js
 * @author Frederik Claus
 * @class Place stores several pictures and is itself stored in the map
 */


define(["dojo/_base/declare", "model/MarkerModel", "model/Photo", "model/Collection", "util/Communicator", "ui/UIState"],
       function (declare, MarkerModel, Photo, Collection, communicator, state) {
          console.log("Place: start");
          return declare(MarkerModel, {
             constructor : function (data) {
                var i, len;
                
                this.type = 'Place';

                this.photos = [];
                this.photoList = null;
                if (data.photos) {
                   //TODO remove Listener and replace this.photoCollection with this.photos (@see Place.js) when gallery, slideshow, ... support photoCollections
                   $.each(data.photos, function (index, photoData) {
                      this.photos.push(new Photo(photoData));
                   });
                   this.sortPhotos();
                   this.photoCollection = new Collection(this.photos, {
                      modelType: "Photo",
                      modelConstructor: Photo,
                      orderBy: "order"
                   });
                   //bind Listener to change this.photos if photoCollection changes -> update this.photos as well
                   this._bindCollectionListener();
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
                this.photos.sort(function (photo, copy) {
                   return photo.order - copy.order;
                });
             },
             /**
              * @description Get a photo by src
              * @returns {Photo}  Photo with src present, else null
              */
             getPhoto : function (src) {
                return this.photoCollection.getByAttribute("photo", src);
             },
             getPhotos : function ()   {
                return this.photos;
             },
             //TODO remove this once gallery, slideshow, ... support photoCollections
             _bindCollectionListener : function () {
                var instance = this;
                this.photoCollection
                   .onInsert(function (photo) {
                      instance.insertPhoto(photo);
                   })
                   .onDelete(function (photo) {
                      instance.deletePhoto(photo);
                   });
             }
          });
       });
   