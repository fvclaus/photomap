/*jslint sloppy : true*/
/*global $, define, main, assert, assertInstance, assertTrue, assertFalse, assertNumber, assertString, gettext */

// No use strict with this.inherited(arguments)
// "use strict";

define(["dojo/_base/declare",
        "./PhotoWidget",
        "../model/Photo",
        "./PhotoCarouselWidget",
        "../util/Communicator",
        "dojo/text!./templates/AdminGallery.html",
        "dojo/i18n",
        "dojo/i18n!./nls/common"],
       function (declare, PhotoWidget, Photo, PhotoCarouselView, communicator, template, i18n) {
          return  declare([PhotoWidget], {

             templateString : template,
             viewName : "AdminGallery",

             startup : function () {
                if (this._started) {
                   return;
                }
                // Give fake img element. It will never be used anyway.
                this.$photos = $("<img></img>");
                this._srcPropertyName = "photo";
                this._carouselOptions = {};
                this.inherited(arguments);

                this._isPhotoLoaded = false;

             },
             postMixInProperties : function () {
                this.inherited(arguments);
                this.messages = i18n.getLocalization("widget", "common", this.lang);
             },
             /**
              * @public
              * @description Runs the Gallery. Generates new Html every time start is called.
\              */
             run : function () {
                assert(this._started, true, "Must call startup() before.");
                assertTrue(this._loaded, "Must call load(photos) before.");
                this._run = true;
                this._empty();
               
                this.$photoContainer
                   .append(
                      $.jqote('#fullGalleryTmpl', {
                         photos: this.carousel.getAllPhotos()
                      }));
                this._initializeSortable();
                this.show();

                this._loaded = true;
             },
             /**
              * @public
              * @description Inserts a new Photo. This will refresh the Gallery, if open.
              */
             insertPhoto : function (photo) {
                this.inherited(arguments);
                if (this._run) {
                   this.refresh();
                }
             },
             /**
              * @public
              * @description Removes a photo. This will refresh the Gallery, if open.
              */
             deletePhoto : function (photo) {
                this.inherited(arguments);
                if (this._run) {
                   this.refresh();
                }
             },
             /*
              * @public
              * @description Reset into state after startup().
              */
             reset : function () {
                this._empty();
                if (this.carousel) {
                   this.carousel.destroy();
                }
                this.carousel = null;
                this._run = false;
                this._loaded = false;
             },
             /**
              * @public
              * @description This will refresh the Gallery. Displaying the photos currently in the carousel.
              */
             refresh : function () {
                //TODO currently this just restarts the whole thing. this could be done better
                this._empty();
                this.run();
             },
             /*
              * @public
              */
             hide : function () {
                this.$photoContainer
                   .removeClass("mp-full-gallery")
                   .addClass("mp-nodisplay");

                this.$container.addClass("mp-nodisplay");
                this.$photoContainer.find("img").css("visibility", "hidden");
             },
             /*
              * @public
              */
             show : function () {
                this.$photoContainer
                   .addClass("mp-full-gallery")
                   .removeClass("mp-nodisplay");

                this.$container.removeClass("mp-nodisplay");
                this.$photoContainer.find("img").css("visibility", "visible");
             },
             /**
              * @private
              * @description This will remove all photos currently displayed.
              */
             _empty : function () {

                if (this.$photoContainer.hasClass("ui-sortable")){
                   this.$photoContainer.sortable("destroy");
                }
                this.$photoContainer
                   .empty();

             },
             /**
              * @private
              * @description Updates the order of all Photos of a single place and notifies the Gallery. 
              * The actual Photo objects will get updated, once the server sends a positive confirmation.
              * @param {Array} photos Must be an array of plain objects with photo, id, title, order attributes.
              * This must not an array of instances of Photos that are in use. 
              */
             _savePhotos : function (photos) {
                
                var instance = this;
                
                photos.forEach(function (photo) {
                   // photo must be a photo dto not the actual photo
                   // the actual photo is changed when the request is successfull
                   assertFalse(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                   assertNumber(photo.order, "photo order has to be a number");
                   assertNumber(photo.id, "photo id has to be a number");
                   assertString(photo.title, "photo title has to be a string");
                });

                communicator.publish("change:photoOrder", photos);
             },
             /**
              * @private
              */
             _bindListener : function () {
                var instance = this;
                this.$close.on("click", function (event) {
                   instance.hide();
                });
             },
             /**
              * @private
              */
             _initializeSortable : function () {
                
                var $currentTile = null,
                    jsonPhotos = [], 
                    jsonPhoto = null,
                    instance = this;
                
                $(".mp-sortable-tile").on("click.UIDisabled", function () {
                   if (instance.isDisabled()) {
                      return false;
                   }
                });
                this.$photoContainer
                   .sortable({
                      items : ".mp-sortable-tile",
                      update : function (event, ui) {
                         jsonPhotos = [];

                         instance.carousel.getAllPhotos().forEach(function (photo, index, photos) {
                            // get html tag for tile containing current photo
                            $currentTile = instance.$photoContainer.find('img[data-keiken-id="' + photo.id + '"]').parent();
                            // make a deep copy
                            jsonPhoto = $.extend(true, {}, photo);
                            jsonPhoto.order = instance.$photoContainer.children().index($currentTile);
                            console.log("Changing order of Photo %s from %d to %d", photo.title, photo.order, jsonPhoto.order);
                            jsonPhotos.push(jsonPhoto);
                            // when all photos with new order are in jsonPhotos, save the order
                            if (jsonPhotos.length === photos.length) {
                               instance._savePhotos(jsonPhotos);
                            }
                         });
                      }
                   });
             }
          });
       });