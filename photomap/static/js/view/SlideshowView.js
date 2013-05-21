/*jslint */
/*global $, define, main, window, UIFullscreen, assert, assertTrue */

"use strict";

/**
 * @author Marc Roemer
 * @class UISlideshow displays the current selected Photo in the Slideshow
 * @requires UICarousel UIFullscreen
 */

define([
   "dojo/_base/declare",
   "view/View",
   "view/PhotoCarouselView",
   "view/FullscreenView",
   "model/Photo",
   "presenter/SlideshowPresenter",
   "util/Communicator",
   "util/Tools",
   "ui/UIState",
   "dojo/domReady!"
   ],
    function (declare, View, PhotoCarouselView, FullscreenView, Photo, SlideshowPresenter, communicator, tools, state) {
       return declare(View, {
          constructor : function () {
             this.$container = $('#mp-slideshow');
             this.viewName = "Slideshow";
             
             this.$inner = $("#mp-slideshow-image-wrapper");
             this.$image = $("#mp-slideshow-image");
             this.$navLeft = $('#mp-slideshow-nav-prev');
             this.$navRight = $('#mp-slideshow-nav-next');
             this.$loader = this.$container.find(".mp-slideshow-loader");

             this.$photoNumber = $(".mp-image-number");
             // need to indicate ready status to frontend tests
             this.$ready = $("<div id=mp-slideshow-ready />")
                .hide()
                .appendTo(this.$container);
             
             this.carousel = null;
             this.presenter = new SlideshowPresenter(this);
             
             this.started = false;
             this._isDisabled = true;
             
             this._bindActivationListener(this.$container, this.viewName);
          },
          isStarted : function () {
             return this.started;
          },
          getCarousel : function () {
             return this.carousel;
          },
          /**
           * @description starts slideshow by initialising and starting the carousel (with given index)
           */
          start: function (index) {
             assert(this.started, false, "slideshow must not be started yet");

             var photos = state.getPhotos(),
                 options = {
                    lazy : true,
                    loader : this.$loader,
                    beforeLoad : this._beforeLoad,
                    afterLoad : this._afterLoad,
                    onUpdate : this._update,
                    context : this
                 },
                 instance = this,
                 //UISlideshow does not need to store imageSources
                 imageSources = [];

             this.started = true;
             
             photos.forEach(function (photo, index) {
                imageSources.push(photo.photo);
             });
             // initialize carousel
             this.carousel = new PhotoCarouselView(this.$inner.find("img.mp-slideshow-image"), photos, "photo", options);
             
             if (photos.length !== 0) {
                $(".mp-slideshow-no-image-msg").hide();
                // it is also possible to start the Carousel with empty photos, but we need to hide the no-images-msg
                this.carousel.start(index);
             }

          },
          /**
           * @description Resets the slideshow to a state before start() was called. 
           * This can be called without ever starting the Slideshow
           */
          reset : function () {
             this.started = false;
             //TODO if the last photo is deleted, it will fade out
             // therefore we must not delete the carousel until the fading out is complete
             // if (this.carousel !== null) {
             // this.carousel.reset();
             // this.carousel = null;
             // }
             this._emptyPhotoNumber();
             $(".mp-slideshow-loader").hide();
             $(".mp-slideshow-no-image-msg").show();
          },
          /**
           * @description Navigates to given index; starts slideshow if carousel is not yet initialized
           */
          //TODO we should probably support navigateTo(photo) instead. 
          // This will shorten the code in other places and provides a more consistend abstraction.
          // All other public methods take photo as parameter.
          navigateTo : function (index) {
             if (!this.started) {
                this.start(index);
             } else {
                this.carousel.navigateTo(index);
             }
          },
          init : function () {
             var instance = this;
             
             this._center();
             // everything that gets centered manually must be corrected on a resize event
             $(window).resize(function () {
                instance._center();
             });
             this._bindListener();
          },
          /**
           * @description Inserts a new Photo. This will not move the Carousel or do anything else.
           */
          insertPhoto : function (photo) {
             assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");

             // this is an unfortunate annoyance, but the gallery can be started without the slideshow
             // therefore we need to check if the gallery is started on an insert photo event
             // this is unfortunate, because the slideshow behaves differntly than the gallery
             if (this.started){
                // does not move to the new photo, because photo cant be on current page
                this.carousel.insertPhoto(photo);
                // updating description & photo number is handled in update
             }
          },
          /**
           * @description Deletes an existing Photo. If Photo is the current Photo the previous Photo is shown.
           * If there is no previous Photo, nothing is shown.
           */
          deletePhoto : function (photo) {
             assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");

             // @see insertPhoto
             if (this.started) {
                // automatically delete if photo is on current page
                this.carousel.deletePhoto(photo);
                // update will take of resetting if it was the last one
             }
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
           * @private
           * @description Executed after photo is updated (=displayed)
           */
          _update : function () {
             var photo = this._updateAndGetCurrentLoadedPhoto();
             // deleted last photo
             if (photo  === null) {
                this.reset();
             } else {
                // right now this is the first time we can update the description
                // on the other events, beforeLoad & afterLoad, the photo src is not set yet
                this._updatePhotoNumber();
             }
             communicator.publish("update:slideshow", photo);
             communicator.publish("enable:slideshow");
          },
          /**
           * @private
           * @description Executed before photos are loaded
           */
          _beforeLoad : function ($photos) {
             // we are expecting to receive a jquery element wrapper
             assert(typeof $photos, "object", "input parameter $photos has to be a jQuery object");
             // trigger event to tell UI that slideshow is about to change
             // @see UIDetailView/Presenter
             communicator.publish("beforeLoad:slideshow");
             communicator.publish("disable:slideshow");
             
          },
          /**
           * @private
           * @description Executed after photos are loaded
           */ 
          _afterLoad : function ($photos) {
             // we are expecting to receive a jquery element wrapper
             assert(typeof $photos, "object", "input parameter $photos has to be a jQuery object");
             //TODO hide loading again
             $photos.each(function () {
                $(this)
                   .siblings(".mp-slideshow-loader")
                   .hide();
             });
          },
          /**
           * @private
           * @description Disable Slideshow, e.g beforeLoad
           */
          disable : function () {
             // need to indicate ready status to frontend tests
             this.$ready.hide();
          },
          /**
           * @private
           * @description Enable Slideshow, e.g after update
           */
          enable : function () {
             // need to indicate ready status to frontend tests
             this.$ready.show();
          },
          /**
           * @private
           * @description Synchronizes the current photo in the slideshow with the one in the UIState
           * @returns {Photo} currentPhoto
           */
          _updateAndGetCurrentLoadedPhoto : function () {
             assert(this.started, true, "slideshow has to be started already");

             // this might be updated at a later point, we can't rely on that
             var photos = state.getPhotos(),
                 // but we can rely on the currentPage
                 imageSources = this.carousel.getAllImageSources(),
                 currentPhoto = null,
                 currentIndex = -1;
             // if it is the only (empty) page the entry is null
             if (imageSources.length > 0) {
                currentPhoto = tools.getObjectByKey("photo", this.$image.attr("src"), photos);
                currentIndex = $.inArray(currentPhoto, photos);
                state.setCurrentLoadedPhoto(currentPhoto);
                state.setCurrentLoadedPhotoIndex(currentIndex);
             }
             return currentPhoto;
          },
          /**
           * @private
           * @description Updates current photo number
           */
          _updatePhotoNumber : function () {
             var photos = state.getPhotos();

             //TODO I think Photo is fine in every language
             this.$photoNumber.text("Photo "+(state.getCurrentLoadedPhotoIndex() + 1) + "/" + photos.length);
          },
          /**
           * @private
           * @description Removes the current photo number
           */
          _emptyPhotoNumber : function () {
             //TODO 0/0 is a little misguiding. I suggest nothing instead.
             // this.$imageNumber.text("0/0");
             this.$photoNumber.text("");
          },
          /**
           * @private
           * @description Sets listener for both navigation elements and the image to start the fullscreen
           */
          _bindListener : function () {
             
             var instance = this;
             
             this.$navLeft.on("click", function () {
                
                console.log("?left?");
                if (!instance.isDisabled()) {
                   instance.presenter.navigate("left");
                }
             });
             this.$navRight.on("click", function () {
                // UIPhotoCarousel does not 'really' support aborting loading of the current photo and skipping to the next one
                if (!instance.isDisabled()) {
                   instance.presenter.navigate("right");
                }
             });
             this.$image.on("click.Slideshow", function (event) {
                /* 
                 * bubbling of event has to be stopped to prevent click on slideshow to be triggered again 
                 * after Fullscreen is already focused, which causes activation problems (-> keyboard events!)
                 */
                event.stopPropagation();
                if (!instance.isDisabled()) {
                   console.log("UISlideshow: Show Fullscreen");
                   instance.presenter.click();
                }
             });
                
             $("body")
               .on("keyup.Slideshow", null, "left", function () {
                  if (!instance.disabled && instance.active) {
                     console.log("UISlideshow: navigating left");
                     instance.presenter.navigate("left");
                  }
               })
               .on("keyup.Slideshow", null, "right", function () {
                  if (!instance.disabled && instance.active) {
                     console.log("UISlideshow: navigating right");
                     instance.presenter.navigate("right");
                  }
               });
          },
          /**
           * @private
           * @description Center elements that cannot be centered with css right now
           */
          _center  : function () {
             //TODO is it really not possible to center those elements with css?
             tools.centerElement(this.$navLeft, "vertical");
             tools.centerElement(this.$navRight, "vertical");
             tools.centerElement(this.$loader, "vertical");
          }
       });
    });
