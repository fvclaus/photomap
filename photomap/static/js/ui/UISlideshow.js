/*jslint */
/*global $, main, UIPhotoCarousel, UIFullscreen */

"use strict";

/**
 * @author Marc Roemer
 * @class UISlideshow displays the current selected Photo in the Slideshow
 * @requires UICarousel UIFullscreen
 */
var UISlideshow = function () {

   this.$container = $('#mp-slideshow');
   this.$inner = $("#mp-slideshow-image-wrapper");
   this.$image = $("#mp-slideshow-image");
   this.$navLeft = $('#mp-slideshow-nav-prev');
   this.$navRight = $('#mp-slideshow-nav-next');

   this.$photoNumber = $(".mp-image-number");
   
   this.carousel = null;
   this.fullscreen = new UIFullscreen(this);
   
   this.isStarted = false;
   this._isDisabled = true;
};

UISlideshow.prototype = {

   initWithoutAjax : function () {
      this.fullscreen.init();
      this._bindListener();
   },
   /**
    * @description starts slideshow by initialising and starting the carousel (with given index)
    */
   start: function (index) {
      var ui = main.getUI(),
          state = ui.getState(),
          photos = state.getPhotos(),
          options = {
             lazy : true,
             effect : "fade",
             beforeLoad : this._beforeLoad,
             afterLoad : this._afterLoad,
             onUpdate : this._update,
             context : this
          },
          instance = this,
          //UISlideshow does not need to store imageSources
          imageSources = [];

      this.isStarted = true;
      
      photos.forEach(function (photo, index) {
         imageSources.push(photo.photo);
      });
      // initialize carousel
      this.carousel = new UIPhotoCarousel(this.$inner.find("img.mp-slideshow-image"), imageSources, options);
      
      if (photos.length !== 0) {
         $(".mp-slideshow-no-image-msg").hide();
         // it is also possible to start the Carousel with empty photos, but we need to hide the no-images-msg
         this.carousel.start(index);
      }

   },
   /**
    * @description This is used by the fullscreen to navigate the slideshow
    */
   //TODO maybe event based?
   navigateLeft : function () {
      this.$navLeft.trigger("click");
   },
   /**
    * @description This is used by the fullscreen to navigate the slideshow
    */
   //TODO maybe event based?
   navigateRight : function () {
      this.$navRight.trigger("click");
   },
   /**
    * @description Inserts a new Photo. This will not move the Carousel or do anything else.
    */
   insertPhoto : function (photo) {
      // this is an unfortunate annoyance, but the gallery can be started without the slideshow
      // therefore we need to check if the gallery is started on an insert photo event
      // this is unfortunate, because the slideshow behaves differntly than the gallery
      if (this.isStarted){
         // does not move to the new photo, because photo cant be on current page
         this.carousel.insertPhoto(photo.photo);
         // update the photo description
         this._updateAndGetCurrentLoadedPhoto();
         main.getUI().getInformation().update(photo);
         // update the photo counter
         
      }
   },
   /**
    * @description Deletes an existing Photo. If Photo is the current Photo the previous Photo is shown.
    * If there is no previous Photo, nothing is shown.
    */
   deletePhoto : function (photo) {
      // @see insertPhoto
      if (this.isStarted) {
         // automatically delete if photo is on current page
         this.carousel.deletePhoto(photo.photo);
         // update the photo counter
         var newPhoto = this._updateAndGetCurrentLoadedPhoto();
         if (newPhoto === null) {
            this.reset();
         } else {
            main.getUI().getInformation().update(newPhoto);
         }
      }
   },
   /**
    * @description Resets the slideshow to a state before start() was called
    */
   reset : function () {
      
      this.isStarted = false;
      
      //TODO if the last photo is deleted, it will fade out
      // therefore we must not delete the carousel until the fading out is complete
      // if (this.carousel !== null) {
           // this.carousel.reset();
         // this.carousel = null;
      // }
      this._emptyPhotoNumber();
      $(".mp-slideshow-loader");
      $(".mp-slideshow-no-image-msg").show();
   },
   /**
    * @description Navigates to given index; starts slideshow if carousel is not yet initialized
    */
   //TODO we should probably support navigateTo(photo) instead. 
   // This will shorten the code in other places and provides a more consistend abstraction.
   // All other public methods take photo as parameter.
   navigateTo : function (index) {
      
      if (!this.isStarted) {
         this.start(index);
      } else {
         this.carousel.navigateTo(index);
      }
   },
   /**
    * @public
    * @description This is used to check if the Slideshow is still loading or updating the currentPhoto.
    * This is also used by the frontend test to 'wait'.
    */
   isDisabled : function () {
      return !this._isDisabled && !main.getUI().isDisabled();
   },
   /**
    * @public
    * @description @see UIFullscreen.isDisabled
    */
   isFullscreenDisabled : function () {
      return this.fullscreen.isDisabled();
   },
   /**
    * @private
    * @description Executed after photos are updated (=displayed)
    */
   _update : function () {
      var photo = this._updateAndGetCurrentLoadedPhoto();
      this.fullscreen.update();
      main.getUI().getInformation().update(photo);
      this._updatePhotoNumber();
      
      //TODO this event is best triggered on the UI object. This is more intuitive and less likely to change
      $("#mp-content").trigger("slideshowChanged");
      this._isDisabled = false;
   },
   /**
    * @private
    * @description Executed before photos are loaded
    */
   _beforeLoad : function ($photos) {
      this._isDisabled = true;
      $photos.each(function () {
         $(this)
            .hide()
            .siblings(".mp-slideshow-loader")
            .show();
      });
   },
   /**
    * @private
    * @description Executed after photos are loaded
    */
   _afterLoad : function ($photos) {
      //TODO hide loading again
      $photos.each(function () {
         $(this)
            .siblings(".mp-slideshow-loader")
            .hide();
      });
   },
   /**
    * @private
    * @description Synchronizes the current photo in the slideshow with the one in the UIState
    * @returns {Photo} currentPhoto
    */
   _updateAndGetCurrentLoadedPhoto : function () {
      
      var ui = main.getUI(),
          state = main.getUIState(),
          // this might be updated at a later point, we can't rely on that
          photos = state.getPhotos(),
          // but we can rely on the currentPage
          imageSources = this.carousel.getAllImageSources(),
          currentPhoto = null,
          currentIndex = -1;
      // if it is the only (empty) page the entry is null
      if (imageSources.length > 0) {
         currentPhoto = ui.getTools().getObjectByKey("photo", this.$image.attr("src"), photos);
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
      var state = main.getUIState(),
          photos = state.getPhotos();

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
      
      var ui  = main.getUI(),
         instance = this;
      
      this.$navLeft.on("click", function () {
         
         console.log("?left?");
         if (instance.isDisabled()) {
            if (!instance.isStarted) {
               //TODO @see $navRight.on("click",...)
               instance.start();
            } else {
               console.log("left");
               instance.carousel.navigateLeft();
            }
         }
      });
      this.$navRight.on("click", function () {
         // UIPhotoCarousel does not 'really' support aborting loading of the current photo and skipping to the next one
         if (instance.isDisabled()) {
            if (!instance.isStarted) {
               //TODO we need to change the text in the empty slideshow to advertise this behaviour
               instance.start();
            } else {
               instance.carousel.navigateRight();
            }
         }
      });
      this.$image.on("click.Slideshow", function () {
         
         if (instance.isDisabled()) {
            instance.fullscreen.open();
         }
      });
   }

};
