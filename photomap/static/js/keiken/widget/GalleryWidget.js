/*jslint sloppy : true*/
/*global define,$, main, fileUpload, assert, assertTrue, assertString, assertFalse, assertNumber, assertNotNull, gettext, UIInput */

// No use strict with this.inherited(arguments);
// "use strict";


/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 * @requires UICarousel
 */
       
define(["dojo/_base/declare",
        "./MultiplePagesPhotoWidget",
        "../model/Photo",
        "../util/Communicator",
        "../util/Tools",
        "../util/InfoText",
        "dojo/text!./templates/Gallery.html",
        "dojo/i18n",
        "dojo/i18n!./nls/Gallery"],
       function (declare, PhotoWidget, Photo, communicator, tools, InfoText, template, i18n) {
          return declare([PhotoWidget], {

             templateString : template,
             viewName : "Gallery",
             postCreate : function () {
                var index = 0;
                // Imitate template looping.
                for (index = 0; index < 4; index++) {
                   this.$tile
                      .clone()
                      .appendTo(this.$tile.parent());
                }
             },
             startup : function (options) {
                if (this._started) {
                   return;
                }
                this.$loader = this.$container.find(".mp-gallery-loader");
                this.$controls = $()
                   .add(this.$insert)
                   .add(this.$open);

                if (options && typeof options.adminMode === "boolean" && options.adminMode) {
                   this._adminMode = true;
                } else {
                   this._adminMode = false;
                   this.$controls.hide();
                   // Disable the use of the controls.
                   this.$controls = $();
                }

                this._carouselOptions = {
                   lazy : !this._adminMode,
                   "effect" : "flip",
                   "duration": 500,
                   loader : this.$loader,
                   beforeLoad : this._beforeLoad,
                   onUpdate : this._update,
                   context : this,
                   navigateToInsertedPhoto : true
                };

                this._srcPropertyName = "thumb";
                this.$thumbs = this.$container.find(".mp-gallery-tile");
                this.$photos = this.$thumbs.find(".mp-thumb");
                this.inherited(arguments);
                 
                this.photos = null;
                // set on insert photo to show the teaser of the photo after it is updated
                // this.showTeaser = false;
                this.currentPhoto = null;
                
                this._infotext = new InfoText(this.$container, "");


                this._showHelpText();
                
                this._infotext
                  .setMessage(gettext("GALLERY_NO_PLACE_SELECTED"))
                  .setOption("hideOnMouseover", false)
                  .start()
                  .open();
                this._bindNavigationListener();
                
                this._bindStartSlideshowListener();
             },
             postMixInProperties : function () {
                this.inherited(arguments);
                this.messages = i18n.getLocalization("keiken/widget", "Gallery", this.lang);
             },
             /**
              * @description Loads all the photos in the gallery and displays them as thumbnails.
              * @idempotent
              */
             run : function () {
                if (this._run) {
                   return;
                }
                this.inherited(arguments);
                this._infotext.destroy();
                // show controls
                this.$controls.removeClass("mp-nodisplay");
             },
             /**
              * @description Resets the Gallery to the state before start() was called. This will delete exisiting Photos.
              */
             reset : function () {
                this._run = false;
                this._load = false;
                this.$loader.addClass("mp-nodisplay");
                this.$controls.addClass("mp-nodisplay");
                if (this.carousel !== null) {
                   this.carousel.destroy();
                   this.carousel = null;
                   this._showHelpText();
                }
             },
             /* 
              * @description Restarts the slideshow if for example the photo order was changed.
              */
             restart : function (photos) {
                this.carousel.update(photos);
             },
             /**
              * @deprecated Use navigateTo instead.
              */
             navigateIfNecessary : function (photo) {
                this.navigateTo(photo);
             },
             setPhotoVisited : function (photo) {
                this.$container.find("img[data-keiken-id='" + photo.id + "']").siblings(".mp-thumb-visited").show();
             },
             /**
              * @private
              * @description handler is called after gallery-thumbs are loaded
              */
             _beforeLoad : function ($photos) {
                // hide all visited icons
                $(".mp-thumb-visited").hide();
             },
             /**
              * @private
              * @description set new infotext message, empty-tiles, visited-icon and show teaser (optional)
              */
             _update : function ($photos) {
                
                var instance = this;
                console.log("GalleryWidget: _update");
                this._showHelpText();
                this._showEmptyTiles();
                // check each thumb if the photo it represents is already visited; if yes -> show 'visited' icon
                this._showVisitedNotification();
                // Check if the updated photo is a newly inserted, if yes open teaser
                // TODO this is AppController business
                // console.log(this.showTeaser);
                // if (this.showTeaser) {
                //    if (this.currentPhoto === null) {
                //       throw new Error("Set showTeaser but no currentPhoto");
                //    }
                //    // warning: this will enable the UIGallery without the UISlideshow even started 'loading'. Quite shacky :)
                //    //TODO maybe we should disable UIGallery/Slideshow/Fullscreen all at once. This make testing alot easier and the user won't even notice it
                //    this.triggerClickOnPhoto(this.currentPhoto);
                //    this.currentPhoto = null;
                //    this.showTeaser = false;

                // } 
             },
             /*
              * @private
              */
             _showHelpText : function () {
                if (!this._run) {
                   this._infotext
                      .setMessage(gettext("GALLERY_NO_PLACE_SELECTED"))
                      .setOption("hideOnMouseover", false)
                      .start()
                      .open();
                } else {
                   if (this.carousel.getAllPhotos().length !== 0) {
                      this._infotext.close();
                   } else {
                      // No photos yet.
                      if (this._adminMode) {
                         this._infotext
                            .setOption("hideOnMouseover", true)
                            .setMessage(gettext("GALLERY_NO_PHOTOS_ADMIN"))
                            .open();
                      } else {
                         this._infotext
                            .setOption("hideOnMouseover", true)
                            .setMessage(gettext("GALLERY_NO_PHOTOS_GUEST"))
                            .open();
                      }
                   }
                }
             },
             _showEmptyTiles : function () {
                if (this._adminMode) {
                   //TODO this is too inefficient.
                   $.each(this.$thumbs, function (index, tile) {
                      
                      if ($(tile).children("img.mp-thumb").attr("src") && $(tile).children("img.mp-thumb").attr("src").length > 0) {
                         $(tile).removeClass("mp-empty-tile");
                      } else {
                         $(tile).addClass("mp-empty-tile");
                      }
                   });
                }
             },
             _showVisitedNotification : function () {
                //TODO This is too inefficient.
                var instance = this;
                $.each(this.$thumbs, function (index, tile) {
                   
                   var photo,
                      $thumb = $(tile).find("img.mp-thumb"),
                      $visited = $(tile).find("img.mp-thumb-visited");
                      // The collection might have been modified in the mean time.
                      try { 
                         if ($thumb.attr("src")) {
                            photo = instance._getPhotoOfImage($thumb);
                            
                            if (photo.isVisited()) {
                               $visited.show();
                            } else {
                               $visited.hide();
                            }
                         } else {
                            // should already be hidden, just in case though.. ;)
                            $visited.hide();
                         }
                   } catch (e) {
                      console.log("GalleryWidget: Could not toggle visited icon for $img element with photo id %d. Maybe the photo has been deleted?", $thumb.attr("data-keiken-id"));
                   }
                });
             },

             /**
              * @private
              * @returns {Photo} Photo for the $image element
              */
             _getPhotoOfImage : function ($image) {
                assertTrue($image.attr("data-keiken-id"), "Id attribute of input parameter $image must not be undefined");
                var id  = parseInt($image.attr("data-keiken-id")),
                    photo = this._photos.get(id);
                assertNotNull(photo, "There must be a photo for every img element.");
                return photo;
                
             },
             /* ---- Listeners ---- */
             
             _bindNavigationListener : function () {
                
                var instance = this;
                
                this.$navLeft.on("click", function () {
                   instance.carousel.navigateLeft();
                   communicator.publish("opened:GalleryPage", instance.carousel.getCurrentPageIndex());
                });
                this.$navRight.on("click", function () {
                   instance.carousel.navigateRight();
                   communicator.publish("opened:GalleryPage", instance.carousel.getCurrentPageIndex());
                });
                
                $("body")
                  .on("keyup.Gallery", null, "left", function () {
                     if (instance._run && instance.active) {
                        instance.$navLeft.trigger("click");
                     }
                  })
                  .on("keyup.Gallery", null, "right", function () {
                     if (instance._run && instance.active) {
                        instance.$navRight.trigger("click");
                     }
                  });
             },
             _bindListener : function () {
                // the following events are not relevant for guests
                if (!this._adminMode) {
                   return;
                }

                // Guests won't have any controls to edit the gallery
                var photo = null,
                    instance = this;

                //bind events on anchors
                //TODO this does not work for the AdminGallery anymore.
                this.$container
                   .on('mouseenter.Gallery', "img.mp-thumb", function (event) {
                      var $el = $(this);
                         photo = $.grep(instance.carousel.getAllPhotos(), function (e, i) {
                            return e.thumb === $el.attr("src");
                         })[0];
                         communicator.publish("hover:GalleryPhoto", {contex : this, element: $el, "photo" : photo});
                   })
                   .on('mouseleave.Gallery', "img.mp-thumb", function (event) {
                         communicator.publish("mouseleave:galleryThumb");
                   });

                this.$open.on("click", function (event) {
                      communicator.publish("clicked:GalleryOpenButton");
                });
                
                
                this.$container.on("click.PhotoMap", ".mp-empty-tile", function () {
                   instance._insert();
                });

                this.$insert.on("click", function () {
                   instance._insert();
                });
             },
             _insert : function () {
                communicator.publish("click:GalleryInsert");
             },
             /**
              * @private
              */
             _bindStartSlideshowListener : function () {
                
                var instance = this;
                
                this.$container
                   .on('click.Gallery', ".mp-gallery-tile, .mp-sortable-tile", function (event) {
                      
                      var $el = $(this).children(".mp-thumb");
                      
                      if (!$(this).hasClass(".mp-empty-tile")) {
                         //TODO navigating to a photo provides a better abstraction then navigation to a specific index
                         // navigating to an index means that we know implementation details of the slideshow, namely
                         // how many photos are displayed per page(!)
                         communicator.publish("click:galleryThumb", instance._getPhotoOfImage($el));
                      }
                   });
             }
          });
       });
