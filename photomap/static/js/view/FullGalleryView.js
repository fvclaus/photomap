/*global $, define, main, assertTrue, assertFalse, assertNumber, assertString, UIInput, gettext */

"use strict";

define(["dojo/_base/declare", "model/Photo", "ui/UIState", "view/StatusMessageView", "dojo/domReady!"], 
       function (declare, Photo, state, statusMessage) {
          
          return  declare(null, {
             constructor : function () {
                this.loaded = false;
                this.carousel = null;
                this.$container = $("#mp-full-left-column").find(".mp-data");
                this.$column = $("#mp-full-left-column");

             },

             /**
              * @description UIFullGallery can be instantiated without a UIPhotoCarousel. It needs to be set before calling start()
              */
             setCarousel : function (carousel) {
                this.carousel = carousel;
             },
             /**
              * @description Starts the Gallery. Generates new Html every time start is called.
              * Therefore there is no need for messy array synchronisation or the like.
              */
             start : function () {
                assertTrue(this.carousel, "carousel has to be initialized already");

                this.$container
                   .addClass("mp-full-gallery")
                   .append(
                      $.jqote('#fullGalleryTmpl', {
                         thumbSources: this.carousel.geAllImageSources()
                      }))
                   .removeClass("mp-nodisplay");
                this._initializeSortable();
                this.$column.removeClass("mp-nodisplay");
                this.loaded = true;
             },
             /**
              * @description Closes the Gallery. This will remove any Html previously created.
              */
             destroy : function () {

                if (this.$container.hasClass("ui-sortable")){
                   this.$container.sortable("destroy");
                }
                this.$container
                   .empty()
                   .removeClass("mp-full-gallery")
                   .addClass("mp-nodisplay");

                this.$column.addClass("mp-nodisplay");
                this.loaded = false;
             },
             /**
              * @public
              * @description Removes the photo from the Gallery if open.
              */
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                // something has been deleted from the gallery
                if (this.loaded) {
                   this._refresh();
                }
             },
             /**
              * @private
              * @description This will refresh the Gallery.
              */
             _refresh : function () {
                //TODO currently this just restarts the whole thing. this could be done better
                this.destroy();
                this.start();
             },
             /**
              * @private
              * @description Updates the order of all Photos of a single place and notifies the Gallery. 
              * The actual Photo objects will get updated, once the server sends a positive confirmation.
              * @param {Array} photos Must be an array of plain objects with photo, id, title, order attributes.
              * This must not an array of instances of Photos that are in use. 
              */
             _savePhotos : function (photos) {
                
                var place = state.getCurrentLoadedPlace(),
                    instance = this;
                
                photos.forEach(function (photo) {
                   // photo must be a photo dto not the actual photo
                   // the actual photo is changed when the request is successfull
                   assertFalse(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                   assertNumber(photo.order, "photo order has to be a number");
                   assertNumber(photo.id, "photo id has to be a number");
                   assertString(photo.title, "photo title has to be a string");
                });

                main.getUI().getInput().show({
                   load : function () {
                      $("input[name='photos']").val(JSON.stringify(photos));
                   },
                   success : function () {
                      // update the 'real' photo order
                      photos.forEach(function (photo, index) {
                         place.getPhoto(photo.photo).order = photo.order;
                         console.log("Update order of photo %d successful.", index);
                      });
                      
                      console.log("All Photos updated. Updating Gallery.");
                      place.sortPhotos();
                      // indicate that the order in gallery & slideshow is off now
                      // this is rarely used. rely on lazy amd loading
                      require(["view/StatusMessageView"], function (statusMessage) {
                         this.statusMessage.update(gettext("PHOTOS_DIRTY"));
                      });
                   },
                   abort : function () {
                      console.log("UIFullGallery: Aborted updating order. Restoring old order");
                      //TODO this could be done better
                      instance._refresh();
                   },
                   type : CONFIRM_DIALOG,
                   url : "/update-photos"
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
                   if (main.getUI().isDisabled()) {
                      return false;
                   }
                });
                this.$container
                   .sortable({
                      items : ".mp-sortable-tile",
                      update : function (event, ui) {
                         jsonPhotos = [];

                         state.getPhotos().forEach(function (photo, index, photos) {
                            // get html tag for tile containing current photo
                            $currentTile = instance.$container.find('img[src="' + photo.thumb + '"]').parent();
                            // make a deep copy
                            jsonPhoto = $.extend(true, {}, photo);
                            jsonPhoto.order = instance.$container.children().index($currentTile);
                            console.log("Changing order of Photo %s from %d to %d", photo.title, photo.order, jsonPhoto.order);
                            jsonPhotos.push(jsonPhoto);
                            // when all photos with new order are in jsonPhotos, save the order
                            if (jsonPhotos.length === photos.length) {
                               instance._savePhotos(jsonPhotos);
                            }
                         });
                      }
                   });
             },
             //TODO start & show currently not in use
             //    show : function () {
             
             //       if (!this.loaded) {
             //          this.start();
             //          //TODO Das geht noch nicht.
             // //         $(".mp-full-gallery").jScrollPane();
             //       }
             //       this.$column.removeClass("mp-nodisplay");
             //    },
             //    hide : function () {
             //       this.$column.addClass("mp-nodisplay");

             //       if (this.changed) {
             //          state.getCurrentPlace().triggerDoubleClick();
             //          this.changed = false;
             //       }
             //    },

          });
       });