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
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "view/View",
        "view/PhotoCarouselView",
        "model/Photo",
        "util/Communicator",
        "util/Tools",
        "util/InfoText",
        "dojo/text!/template/Gallery",
        "module",
        "dojo/domReady!"
       ],
       function (declare, _WidgetBase, _TemplatedMixin, View, PhotoCarouselView,  Photo, communicator, tools, InfoText, template, module) {

          return declare([View, _WidgetBase, _TemplatedMixin], {
             templateString : template,
             buildRendering : function () {
                this.inherited(arguments);
                var instance = this;
                this._attachPoints.forEach(function (attachPoint) {
                   var jQSelectorName = "$" + attachPoint.replace("Node", "");
                   instance[jQSelectorName] = $(instance[attachPoint]);
                });
                this.$container = $(this.domNode);
             },
             startup : function () {
                if (this._started) {
                   return;
                }
                this.inherited(arguments);
                this.module = module;
                this.viewName = "Gallery";
                
                // this.$hidden = $("#mp-gallery-thumbs");
                this.$thumbs = this.$container.find(".mp-gallery-tile");
                this.$photos = this.$thumbs.find(".mp-thumb");
                this.$loader = this.$container.find(".mp-gallery-loader");

                this.carousel = null;
                
                this.photos = null;
                this.started = false;
                // set on insert photo to show the teaser of the photo after it is updated
                // this.showTeaser = false;
                this.currentPhoto = null;
                
                this._infotext = new InfoText(this.$container, "");

                this.$controls = $()
                   .add(this.$insert)
                   .add(this.$open);

                this._bindActivationListener(this.$container, this.viewName);
                this._bindListener();
                this._showHelpText();
                
                this._infotext
                  .setMessage(gettext("GALLERY_NO_PLACE_SELECTED"))
                  .setOption("hideOnMouseover", false)
                  .start()
                  .open();
                this._bindNavigationListener();
                
                this._bindStartSlideshowListener();

                this.options = {
                   lazy : !this._isAdmin(),
                   "effect" : "fade",
                   "duration": 500,
                   loader : this.$loader,
                   beforeLoad : this._beforeLoad,
                   afterLoad : this._afterLoad,
                   onUpdate : this._update,
                   context : this,
                   navigateToInsertedPhoto : true,
                };

                this.srcPropertyName = "thumb";

             },
             load : function (photos) {
                assertInstance(photos, Array, "Photos must be of type Array.");
                assertTrue(this._started, "Must call startup() before.");
                this._loaded = true;
                this.carousel = new PhotoCarouselView(this.$inner.find("img.mp-thumb"), photos, this.srcPropertyName, this.options);
             },
             /**
              * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
              */
             run : function () {
                assertTrue(this._started,  "Must call startup() before.");
                assertTrue(this._loaded, "Must call load(photos) before.");
                this._run = true;
                
                this._infotext.destroy();
                // show insert photo button
                this.$controls.removeClass("mp-nodisplay");

                // disable ui while loading & show loader
                communicator.publish("disable:ui");
                this.carousel.start();
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
                   this.carousel.reset();
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
              * @description adds new photo to gallery.
              */
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                // automatically adds the photo if we are on last page
                this.carousel.insertPhoto(photo);
                // show teaser after the photo is loaded
                this.showTeaser = true;
                this.currentPhoto = photo;
                // Will automatically navigate to the new photo
                if (!this._run) {
                   // show the new photo
                   //TODO this does now show the new photo yet
                   this.run();
                }
             },
             /**
              * @description Deletes an existing Photo. If the Photo was on the current page, fade it out and move all
              * remaining Photos to the left. If Photo was the last Photo, show an empty page.
              */
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                 // automatically delete if photo is on current page
                // otherwise we dont care
                this.carousel.deletePhoto(photo);
             },
             /**
              * @description Checks if current loaded photo is in the currrently visible gallery slider, if not gallery will move to containing slider
              */
             navigateIfNecessary : function (photo) {
                assertInstance(photo, Photo, "Parameter photo has to be of type Photo.");
                var currentIndex = this._getIndexOfId(photo.id),
                    minIndex = this._getIndexOfFirstThumbnail(),
                    maxIndex = this._getIndexOfLastThumbnail();
                
                if (currentIndex < minIndex) {
                   this.$navLeft.trigger("click");
                } else if (currentIndex > maxIndex) {
                   this.$navRight.trigger("click");
                }
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
             _afterLoad : function ($photos) {
                //enable ui
                communicator.publish("enable:ui");
             },
             /**
              * @private
              * @description set new infotext message, empty-tiles, visited-icon and show teaser (optional)
              */
             _update : function ($photos) {
                
                var instance = this;
                
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
                      if (this._isAdmin()) {
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
                if (this._isAdmin()) {
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
             /*
              * @private
              */
             _getIndexOfId : function (id) {
                assertNumber(id, "Parameter id must be of type number.");
                var photoIndex = -1,
                    photos = this.carousel.getAllPhotos();

                for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
                   if (photos[photoIndex].id === id) {
                      return photoIndex;
                   }
                }
                return -1;
             },
             /**
              * @private
              * @returns {int} Index of the $image element in all Photos of that Place, -1 if Photo does not belong to this place
              */
             _getIndexOfImage : function ($image) {
                assertTrue($image.attr("data-keiken-id"), "Id attribute of input parameter $image must not be undefined");
                return this._getIndexOfId(parseInt($image.attr("data-keiken-id")));
             },
             /**
              * @private
              * @returns {int} Index of the first photo currently visible
              */
             _getIndexOfFirstThumbnail : function () {
                return this._getIndexOfImage(this.$photos.first());
             },
             /**
              * @private
              * @return {int} Index of the last photo currently visible
              */
             _getIndexOfLastThumbnail : function () {
                //this does not work with a simple selector
                var $photo = this.$photos.first();
                this.$photos.each(function (photoIndex) {
                   if ($(this).attr("src")){
                      $photo = $(this);
                   }
                });
                return this._getIndexOfImage($photo);
             },
             /* @private
              * @returns {Photo} Photo for the $image element
              */
             _getPhotoOfImage : function ($image) {
                assertTrue($image.attr("data-keiken-id"), "Id attribute of input parameter $image must not be undefined");
                var index  = this._getIndexOfImage($image),
                    photo = this.carousel.getAllPhotos()[index];
                assertNotNull(photo, "There must be a photo for every img element.");
                return photo;
                
             },
             /**
              * @private
              */
             _navigateToLastPage : function () {
                this.carousel.navigateTo("end");
             },

             
             /* ---- Listeners ---- */
             
             _bindNavigationListener : function () {
                
                var instance = this;
                
                this.$navLeft.on("click", function () {
                   
                   if (!instance.isDisabled()) {
                      instance.carousel.navigateLeft();
                   }
                });
                this.$navRight.on("click", function () {
                   
                   if (!instance.isDisabled()) {
                      instance.carousel.navigateRight();
                   }
                });
                
                $("body")
                  .on("keyup.Gallery", null, "left", function () {
                     if (instance._run && instance.active && !instance.disabled) {
                        console.log("UIGallery: navigating left");
                        instance.carousel.navigateLeft();
                     }
                  })
                  .on("keyup.Gallery", null, "right", function () {
                     if (instance._run && instance.active && !instance.disabled) {
                        console.log("UIGallery: navigating right");
                        instance.carousel.navigateRight();
                     }
                  });
             },
             /*
              * @private
              */
             _isAdmin : function () {
                return this.$controls.length > 0;
             },
             _bindListener : function () {
                // Guests won't have any controls to edit the gallery
                var authorized = this._isAdmin(),
                    photo = null,
                    instance = this;

                // the following events are not relevant for guests
                if (!authorized) {
                   return;
                }
                //bind events on anchors
                //TODO this does not work for the AdminGallery anymore.
                this.$container
                   .on('mouseenter.Gallery', "img.mp-thumb", function (event) {
                      var $el = $(this);
                      
                      if (!instance.isDisabled()) {
                         
                         photo = $.grep(this.carousel.getAllPhotos(), function (e, i) {
                            return e.thumb === $el.attr("src");
                         })[0];
                         communicator.publish("hover:GalleryPhoto", {contex : this, element: $el, "photo" : photo});
                         
                      }
                   })
                   .on('mouseleave.Gallery', "img.mp-thumb", function (event) {
                      if (!instance.isDisabled()) {
                         communicator.publish("mouseleave:galleryThumb");
                      }
                   });

                this.$open.on("click", function (event) {
                   
                   if (!instance.isDisabled()) {
                      communicator.publish("clicked:GalleryOpenButton");
                   }
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
                      
                      if (!instance.isDisabled() && !$(this).hasClass(".mp-empty-tile")) {
                         //TODO navigating to a photo provides a better abstraction then navigation to a specific index
                         // navigating to an index means that we know implementation details of the slideshow, namely
                         // how many photos are displayed per page(!)
                         communicator.publish("click:galleryThumb", instance._getPhotoOfImage($el));
                      }
                   });
             }
             /**
              * @private
              * Triggers a click on the photo. Bypasses every listener, because they might be disabled
              */
             // triggerClickOnPhoto : function (photo) {
             //    var $image = this.$photos.filter("[src='" + photo.thumb + "']"),
             //        index = this._getIndexOfImage($image);
             //    if (index !== -1) {
             //       communicator.publish("click:galleryThumb", this._getPhotoOfImage($image));
             //    } else {
             //       console.log("Could not find photo %s in UIGallery. Maybe it is not loaded yet", photo.photo);
             //    }
             // },
          });
       });
