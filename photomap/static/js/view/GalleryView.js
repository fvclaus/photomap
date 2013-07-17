/*jslint */
/*global define,$, main, fileUpload, assert, assertTrue, assertString, assertFalse, assertNumber, assertNotNull, gettext, UIInput */

"use strict";

/**
 * @author Frederik Claus
 * @class UIFullGallery displays all Photos of the current Place as thumbnails to allow easy editing and D'n'D.
 * @requires ClientServer
 */
       
define(["dojo/_base/declare",
"view/View",
        "view/PhotoCarouselView",
        "view/FullGalleryView",
        "presenter/GalleryPresenter",
        "util/Communicator",
        "util/Tools",
        "ui/UIState",
        "util/Tooltip",
        "dojo/domReady!"
       ],
       function (declare, View, PhotoCarouselView, FullGalleryView, GalleryPresenter, communicator, tools, state, Tooltip) {

/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 * @requires UICarousel
 */
          return declare(View, {
             constructor : function () {
                this.$container = $('#mp-gallery');
                this.viewName = "Gallery";
                
                this.$inner = $('#mp-gallery-inner');
                // this.$hidden = $("#mp-gallery-thumbs");
                this.$thumbs = $(".mp-gallery-tile");
                this.$navLeft = $("#mp-gallery-nav-left");
                this.$navRight = $("#mp-gallery-nav-right");
                this.$photos = this.$thumbs.find(".mp-thumb");
                this.$containerColumn = $("#mp-left-column");
                this.$loader = this.$container.find(".mp-gallery-loader");

                this.carousel = null;
                
                this.photos = null;
                this.started = false;
                // set on insert photo to show the teaser of the photo after it is updated
                this.showTeaser = false;
                this.currentPhoto = null;
                
                this.tooltip = new Tooltip(this.$container, "");
                this.fullGallery = new FullGalleryView();
                this.$controls = $()
                   .add($(".mp-option-insert-photo"))
                   .add($(".mp-open-full-gallery"));

                // not present in guest mode
                this.$insert = $(".mp-option-insert-photo");

                this.presenter = new GalleryPresenter(this);
                
                this._bindActivationListener(this.$container, this.viewName);
                this._bindListener();
                
                this.tooltip
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
             getCarousel : function () {
                return this.carousel;
             },
             isStarted : function () {
                return this.started;
             },
             /**
              * Triggers a click on the photo. Bypasses every listener, because they might be disabled
              */
             triggerClickOnPhoto : function (photo) {
                var $image = this.$photos.filter("[src='" + photo.thumb + "']"),
                    index = this._getIndexOfImage($image);
                if (index !== -1) {
                   this.presenter.click(index);
                } else {
                   console.log("Could not find photo %s in UIGallery. Maybe it is not loaded yet", photo.photo);
                }
             },
             /*
              * @presenter
              */
             load : function (photos) {
                this.reset();
                this.carousel = new PhotoCarouselView(this.$inner.find("img.mp-thumb"), photos, this.srcPropertyName, this.options);
             },
             /**
              * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
              */
             start : function () {
                assert(this.started, false, "gallery must not be started yet");
                
                var instance = this;

                this.started = true;
                
                // reset FullGallery
                this.fullGallery.destroy();
                this.tooltip.destroy();
                // show insert photo button
                this.$controls.removeClass("mp-nodisplay");


                // this.carousel = new PhotoCarouselView(this.$inner.find("img.mp-thumb"), photos, "thumb", options);
                this.fullGallery.setCarousel(this.carousel);
                // disable ui while loading & show loader
                communicator.publish("disable:ui");
                this.carousel.start();
             },
             /**
              * @description Resets the Gallery to the state before start() was called. This will delete exisiting Photos.
              */
             reset : function () {
                this.started = false;
                $(".mp-gallery-loader").addClass("mp-nodisplay");
                this.$controls.addClass("mp-nodisplay");
                if (this.carousel !== null) {
                   this.carousel.reset();
                   this.carousel = null;
                }
             },
             /* 
              * @presenter
              * @description Restarts the slideshow if for example the photo order was changed.
              */
             restart : function (photos) {
                this.carousel.update(photos);
             },
             /**
              * @description adds new photo to gallery.
              */
             insertPhoto : function (photo) {
                
                // this.imageSources.push(photo.thumb);
                // automatically adds the photo if we are on last page
                this.carousel.insertPhoto(photo);
                // show teaser after the photo is loaded
                this.showTeaser = true;
                this.currentPhoto = photo;
                // Will automatically navigate to the new photo
                if (!this.started) {
                   // show the new photo
                   //TODO this does now show the new photo yet
                   this.start();
                }
             },
             /**
              * @description Deletes an existing Photo. If the Photo was on the current page, fade it out and move all
              * remaining Photos to the left. If Photo was the last Photo, show an empty page.
              */
             deletePhoto : function (photo) {
                // not possible to delete something without the gallery started
                assert(this.started, true, "gallery has to be started already");
                // automatically delete if photo is on current page
                // otherwise we dont care
                this.carousel.deletePhoto(photo);
                this.fullGallery.deletePhoto(photo);
             },
             /**
              * @description Checks if current loaded photo is in the currrently visible gallery slider, if not gallery will move to containing slider
              */
             navigateIfNecessary : function (photo) {
                var currentIndex = this._getIndexOfPhoto(photo),
                    minIndex = this._getIndexOfFirstThumbnail(),
                    maxIndex = this._getIndexOfLastThumbnail();
                
                if (currentIndex < minIndex) {
                   this.$navLeft.trigger("click");
                } else if (currentIndex > maxIndex) {
                   this.$navRight.trigger("click");
                }
             },
             setPhotoVisited : function (photo) {
                
                var currentImages = [];
                
                $.each(this.$thumbs, function (index, tile) {
                   currentImages.push($(tile).find("img.mp-thumb").attr("src") || null);
                });
                
                if (currentImages.indexOf(photo.thumb) !== -1) {
                   this.$container.find("img[src='" + photo.thumb + "']").siblings(".mp-thumb-visited").show();
                }
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
              * @description set new tooltip message, empty-tiles, visited-icon and show teaser (optional)
              */
             _update : function ($photos) {
                
                var instance = this;
                
                this._showHelpText();
                this._showEmptyTiles();
                // check each thumb if the photo it represents is already visited; if yes -> show 'visited' icon
                this._showVisitedNotification();
                // Check if the updated photo is a newly inserted, if yes open teaser
                console.log(this.showTeaser);
                if (this.showTeaser) {
                   if (this.currentPhoto === null) {
                      throw new Error("Set showTeaser but no currentPhoto");
                   }
                   // warning: this will enable the UIGallery without the UISlideshow even started 'loading'. Quite shacky :)
                   //TODO maybe we should disable UIGallery/Slideshow/Fullscreen all at once. This make testing alot easier and the user won't even notice it
                   this.triggerClickOnPhoto(this.currentPhoto);
                   this.currentPhoto = null;
                   this.showTeaser = false;

                } 
             },
             /*
              * @private
              */
             _showHelpText : function () {
                //TODO This is too inefficient.
                if (this.carousel.getAllPhotos().length > 0) {
                   this.tooltip.close();
                } else {
                   if (this._isAdmin()) {
                      this.tooltip
                        .setOption("hideOnMouseover", true)
                        .setMessage(gettext("GALLERY_NO_PHOTOS_ADMIN"))
                        .open();
                   } else {
                      this.tooltip
                        .setOption("hideOnMouseover", true)
                        .setMessage(gettext("GALLERY_NO_PHOTOS_GUEST"))
                        .open();
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
                });
             },
             /**
              * @private
              * @returns {int} Index of the $image element in all Photos of that Place, -1 if Photo does not belong to this place
              */
             _getIndexOfImage : function ($image) {
                assertTrue($image.attr("src"), "src attribute of input parameter $image must not be undefined");
                return this.carousel.getAllImageSources().indexOf($image.attr("src"));
             },
             /*
              * @private
              */
             _getIndexOfSrc : function (src) {
                return this.carousel.getAllImageSources().indexOf(src);
             },
             /* @private
              * @returns {Photo} Photo for the $image element
              */
             _getPhotoOfImage : function ($image) {
                assertTrue($image.attr("src"), "src attribute of input parameter $image must not be undefined");
                var photo = this.carousel.getPhotoForSrc($image.attr("src"));
                assertNotNull(photo, "There must be a photo for every img element.");
                return photo;
                
             },
             /**
              * @private
              */
             _getIndexOfPhoto : function (photo) {
                return this._getIndexOfSrc(photo[this.srcPropertyName]);
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
                     if (instance.started && instance.active && !instance.disabled) {
                        console.log("UIGallery: navigating left");
                        instance.carousel.navigateLeft();
                     }
                  })
                  .on("keyup.Gallery", null, "right", function () {
                     if (instance.started && instance.active && !instance.disabled) {
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
                // bind them to thumbs in the Gallery & FullGallery
                $(".mp-left-column")
                   .on('mouseenter.Gallery', "img.mp-thumb", function (event) {
                      var $el = $(this);
                      
                      if (!instance.isDisabled()) {
                         
                         photo = $.grep(state.getPhotos(), function (e, i) {
                            return e.thumb === $el.attr("src");
                         })[0];
                         state.setCurrentPhoto(photo);
                         instance.presenter.mouseEnter($el, photo);
                      }
                   })
                   .on('mouseleave.Gallery', "img.mp-thumb", function (event) {
                      
                      if (!instance.isDisabled()) {
                            instance.presenter.mouseLeave();
                      }
                   });

                $(".mp-open-full-gallery").on("click", function (event) {
                   
                   if (!instance.isDisabled()) {
                      instance.fullGallery.start();
                   }
                });
                $(".mp-close-full-left-column").on("click", function (event) {
                   
                   if (!instance.isDisabled()) {
                      instance.fullGallery.destroy();
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
                this.presenter.insert();
             },
             /**
              * @private
              */
             _bindStartSlideshowListener : function () {
                
                var instance = this;
                
                this.$containerColumn
                   .on('click.Gallery', ".mp-gallery-tile, .mp-sortable-tile", function (event) {
                      
                      var $el = $(this).children(".mp-thumb");
                      
                      if (!instance.isDisabled() && !$(this).hasClass(".mp-empty-tile")) {
                         //TODO navigating to a photo provides a better abstraction then navigation to a specific index
                         // navigating to an index means that we know implementation details of the slideshow, namely
                         // how many photos are displayed per page(!)
                         instance.presenter.click(instance._getPhotoOfImage($el));
                      }
                   });
             }
          });
       });
