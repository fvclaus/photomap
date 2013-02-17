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
   
   this.carousel = null;
   this.fullscreen = new UIFullscreen(this);
   
   this.isStarted = false;
   this.isLoading = false;
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
         // update the photo counter
         this._updateCurrentLoadedPhoto();
         main.getUI().getInformation().updatePhoto();
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
         this._updateCurrentLoadedPhoto();
         main.getUI().getInformation().updatePhoto();
      }
   },
   /**
    * @description Resets the slideshow to a state before start() was called
    */
   reset : function () {
      
      this.isStarted = false;
      if (this.carousel !== null) {
         //TODO why do we reset it + set it to null?
         this.carousel.reset();
         this.carousel = null;
      }
      this.imageSources = [];
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
    * @private
    * @description Executed after photos are updated (=displayed)
    */
   _update : function () {
      this._updateCurrentLoadedPhoto();
      this.fullscreen.update();
      main.getUI().getInformation().updatePhoto();
      //TODO this event is best triggered on the UI object. This is more intuitive and less likely to change
      $("#mp-content").trigger("slideshowChanged");
   },
   /**
    * @private
    * @description Executed before photos are loaded
    */
   _beforeLoad : function ($photos) {
      this.isLoading = true;
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
      this.isLoading = false;
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
    */
   _updateCurrentLoadedPhoto : function () {
      
      var ui = main.getUI(),
         state = main.getUIState(),
         photos = state.getPhotos(),
         currentPhoto = ui.getTools().getObjectByKey("photo", this.$image.attr("src"), photos),
         currentIndex = $.inArray(currentPhoto, photos);

      if (currentPhoto !== null) {
         state.setCurrentLoadedPhoto(currentPhoto);
         state.setCurrentLoadedPhotoIndex(currentIndex);
      }
   },
   /**
    * @private 
    * @return true if interface is ready to accept new commands, false otherwise
    */
   _isReady : function () {
      return !this.isLoading && !main.getUI().isDisabled();
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
         if (instance._isReady()) {
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
         if (instance._isReady()) {
            if (!instance.isStarted) {
               //TODO we need to change the text in the empty slideshow to advertise this behaviour
               instance.start();
            } else {
               instance.carousel.navigateRight();
            }
         }
      });
      this.$image.on("click.Slideshow", function () {
         
         if (instance._isReady()) {
            instance.fullscreen.open();
         }
      });
   }

};
