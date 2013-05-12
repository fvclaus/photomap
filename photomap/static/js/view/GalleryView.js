/*jslint */
/*global define,$, main, fileUpload, assert, assertTrue, assertString, assertFalse, assertNumber,  gettext, UIInput */

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
        "util/ClientState",
        "ui/UIState",
        "dojo/domReady!"
       ],
       function (declare, View, PhotoCarouselView, FullGalleryView, GalleryPresenter, communicator, tools, clientstate, state) {

/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 * @requires UICarousel
 */
          return declare(View, {
             constructor : function () {
                this.$container = $('#mp-gallery');
                this.$inner = $('#mp-gallery-inner');
                // this.$hidden = $("#mp-gallery-thumbs");
                this.$thumbs = $(".mp-gallery-tile");
                this.$navLeft = $("#mp-gallery-nav-left");
                this.$navRight = $("#mp-gallery-nav-right");
                this.$photos = this.$thumbs.find(".mp-thumb");
                this.$containerColumn = $("#mp-left-column");
                this.$loader = this.$container.find(".mp-gallery-loader");

                this.$isEmpty = $("#mp-gallery-no-image");
                this.$isNotStarted = $("#mp-gallery-not-started");

                this.carousel = null;
                
                this.photos = null;
                this.isStarted = false;
                // set on insert photo to show the teaser of the photo after it is updated
                this.showTeaser = false;
                this.currentPhoto = null;
                
                this.fullGallery = new FullGalleryView();
                this.$controls = $()
                   .add($(".mp-option-insert-photo"))
                   .add($(".mp-open-full-gallery"));

                // not present in guest mode
                this.$insert = $(".mp-option-insert-photo");

                this.presenter = new GalleryPresenter(this);

             },
             getCarousel : function () {
                return this.carousel;
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
             /**
              * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
              */
             start : function (photos) {
                assert(this.isStarted, false, "gallery must not be started yet");
                
                var options,
                    effect,
                    instance = this,
                    imageSources = [];

                this.isStarted = true;
                
                // reset FullGallery
                this.fullGallery.destroy();
                // show insert photo button
                this.$controls.removeClass("mp-nodisplay");


                // initialize and start carousel
                if (navigator.sayswho[0] === "Firefox") {
                   effect = "fade";
                } else {
                   effect = "flip";
                }
                options = {
                   lazy : !clientstate.isAdmin(),
                   "effect" : effect,
                   duration: 300,
                   loader : this.$loader,
                   beforeLoad : this._beforeLoad,
                   afterLoad : this._afterLoad,
                   onUpdate : this._update,
                   context : this
                };
                photos.forEach(function (photo, index) {
                   imageSources.push(photo.thumb);
                });
                this.carousel = new PhotoCarouselView(this.$inner.find("img.mp-thumb"), photos, "thumb", options);
                this.fullGallery.setCarousel(this.carousel);

                // disable ui while loading & show loader
                state.setAlbumLoading(true);
                communicator.publish("disable:ui");
                // ui.showLoading();
                this.carousel.start();

                // show/hide correct message
                this.$isNotStarted.hide();
                if (photos.length === 0) {
                   // display table is necessary to center the message
                   this.$isEmpty.css("display", "table");
                } else {
                   this.$isEmpty.hide();
                }
             },
             /**
              * @description Resets the Gallery to the state before start() was called. This will delete exisiting Photos.
              */
             reset : function () {
                
                this.isStarted = false;
                $(".mp-gallery-loader").addClass("mp-nodisplay");
                this.$controls.addClass("mp-nodisplay");
                if (this.carousel !== null) {
                   this.carousel.reset();
                   this.carousel = null;
                }
                // display table is necessary to center the message
                this.$isEmpty.css("display", "table");
             },
             init : function () {
                
                if (clientstate.isAdmin()) {
                   this._bindListener();
                }
                this._bindNavigationListener();
                this._bindStartSlideshowListener();

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
                // hide the 'no pictures yet' text
                this.$isEmpty.hide();
                // navigate to the picture if we are not on the last page
                if (this.isStarted && !this.carousel.isLastPage()) {
                   this._navigateToLastPage();
                } else if (!this.isStarted) {
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
                assert(this.isStarted, true, "gallery has to be started already");
                // automatically delete if photo is on current page
                // otherwise we dont care
                this.carousel.deletePhoto(photo);
                this.fullGallery.deletePhoto(photo);
             },
             /**
              * @description Resets the Gallery if the deleted place was the one that is currently open
              */
             placeDeleteReset : function (place) {
                if (state.getCurrentPlace() === place) {
                   this.reset();
                }
             },
             /**
              * @description Checks if current loaded photo is in the currrently visible gallery slider, if not gallery will move to containing slider
              */
             checkSlider : function () {
                
                var currentIndex = state.getCurrentLoadedPhotoIndex(),
                    minIndex = this._getIndexOfFirstThumbnail(),
                    maxIndex = this._getIndexOfLastThumbnail();
                
                if (currentIndex < minIndex) {
                   this.$navLeft.trigger("click");
                } else if (currentIndex > maxIndex) {
                   this.$navRight.trigger("click");
                }
             },
             /**
              * @private
              * @description handler is called after gallery-thumbs are loaded
              */
             _beforeLoad : function ($photos) {
                //TODO this is empty, loading-icon is taken care of in PhotoCarousel
             },
             _afterLoad : function ($photos) {
                //enable ui
                communicator.publish("enable:ui");
             },
             /**
              * @private
              * @description Check if the updated photo is a newly insert, if yes open teaser
              */
             _update : function ($photos) {

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
             /**
              * @private
              * @returns {int} Index of the $image element in all Photos of that Place, -1 if Photo does not belong to this place
              */
             _getIndexOfImage : function ($image) {
                assertTrue($image.attr("src"), "src attribute of input parameter $image must not be undefined");
                return this.carousel.getAllImageSources().indexOf($image.attr("src"));
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
             },
             
             _bindListener : function () {

                var authorized = clientstate.isAdmin(),
                    photo = null,
                    instance = this;
                
                
                //TODO this is not used atm, if it is actually needed please use AppController + Communicator + GalleryPresenter for the trigger/listen/handle chain
                // // this is triggered by the fullgallery
                // $(ui).on("photosOrderUpdate.mp", function (place) {
                   // if (place === state.getCurrentLoadedPlace()) {
                      // instance.isDirty = true;
                      // instance.$dirtyWarning.removeClass("mp-nodisplay");
                   // }
                // });

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
                         
                         if (authorized) {
                            instance.presenter.mouseEnter($el, photo);
                         }
                      }
                   })
                   .on('mouseleave.Gallery', "img.mp-thumb", function (event) {
                      var $el = $(this);
                      
                      if (!instance.isDisabled()) {
                         
                         if (authorized) {
                            instance.presenter.mouseLeave();
                         }
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
                      
                      var $el = $(this).children();
                      
                      if (!instance.isDisabled()) {
                         //TODO navigating to a photo provides a better abstraction then navigation to a specific index
                         // navigating to an index means that we know implementation details of the slideshow, namely
                         // how many photos are displayed per page(!)
                         instance.presenter.click(instance._getIndexOfImage($el));
                      }
                   });
             }
          });
       });
