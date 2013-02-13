/*jslint */
/*global $, main, UIPhotoCarousel, UIFullscreen */

"use strict";

/**
 * @author Marc Roemer
 * @class UISlideshow displays the current selected Photo in the Slideshow
 * @requires UICarousel UIFullscreen
 */

var UISlideshow;

UISlideshow = function () {

   this.$container = $('#mp-slideshow');
   this.$inner = $("#mp-slideshow-image-wrapper");
   this.$image = $("#mp-slideshow-image");
   this.$navLeft = $('#mp-slideshow-nav-prev');
   this.$navRight = $('#mp-slideshow-nav-next');
   
   this.carousel = null;
   this.fullscreen = new UIFullscreen(this);
   
   this.isStarted = false;
};

UISlideshow.prototype = {

   initWithoutAjax : function () {
      this.fullscreen.init();
      this._bindNavigationListener();
      this._bindStartFullscreenListener();
   },
   getCarousel : function () {
      return this.carousel;
   },
   getFullscreen : function () {
      return this.fullscreen;
   },
   insertPhoto : function (photo) {
      // this is an unfortunate annoyance, but the gallery can be started without the slideshow
      // therefore we need to check if the gallery is started on an insert photo event
      // this is unfortunate, because the slideshow behaves differntly than the gallery
      if (this.isStarted){
         // does not move to the new photo, because photo cant be on current page
         this.carousel.insertPhoto(photo.photo);
      }
   },
   deletePhoto : function (photo) {
      // @see insertPhoto
      if (this.isStarted) {
         // automatically delete if photo is on current page
         this.carousel.deletePhoto(photo.photo);
         // update the photo counter
         this.updateCurrentLoadedPhoto();
      }
   },
   /**
    * @description starts slideshow by initialising and starting the carousel (with given index)
    */
   start: function (index) {
      var ui = main.getUI(),
          state = ui.getState(),
          photos = state.getPhotos(),
          options,
          instance = this,
          //UISlideshow does not need to store imageSources
          imageSources = [];

      this.isStarted = true;
      

      // initialize and start carousel
      options = {
         lazy : true,
         effect : "fade",
         onLoad : instance._load,
         onUpdate : instance._update
      };
      photos.forEach(function (photo, index) {
         imageSources.push(photo.photo);
      });
      this.carousel = new UIPhotoCarousel(this.$inner, imageSources, options);
      
      if (photos.length !== 0) {
         $(".mp-slideshow-no-image-msg").hide();
         this.carousel.start(index);
      }

   },
   reset : function () {
      
      this.isStarted = false;
      if (this.carousel !== null) {
         this.carousel.reset();
         this.carousel = null;
      }
      this.imageSources = [];
      $(".mp-slideshow-no-image-msg").show();
   },
   /**
    * @description navigates to given index; starts slideshow if carousel is not yet initialized
    */
   navigateTo : function (index) {
      
      if (!this.isStarted) {
         this.start(index);
      } else {
         this.carousel.navigateTo(index);
      }
   },
   /**
    * @private
    * @description handler is called after slideshow-image is displayed
    */
   _update : function () {
      var ui = main.getUI(),
         description = ui.getInformation(),
         slideshow = ui.getSlideshow();
   
      slideshow.updateCurrentLoadedPhoto();
      slideshow.getFullscreen().update();
      description.updatePhoto();
      $("#mp-content").trigger("slideshowChanged");
   },
   /**
    * @private
    * @description handler is called after slideshow-image is loaded
    */
   _load : function () {
      
      // var ui = main.getUI(),
      //    state = ui.getState(),
      //    description = ui.getInformation(),
      //    slideshow = ui.getSlideshow();

   },
   updateCurrentLoadedPhoto : function () {
      
      var ui = main.getUI(),
         state = main.getUIState(),
         photos = state.getPhotos(),
         currentPhoto = ui.getTools().getObjectByKey("photo", this.$image.attr("src"), photos),
         currentIndex = $.inArray(currentPhoto, photos);
      
      state.setCurrentLoadedPhoto(currentPhoto);
      state.setCurrentLoadedPhotoIndex(currentIndex);
   },
   navigateLeft : function () {
      this.$navLeft.trigger("click");
   },
   navigateRight : function () {
      this.$navRight.trigger("click");
   },
   /* ---- Listeners ---- */
   _bindNavigationListener : function () {
      
      var ui  = main.getUI(),
         instance = this;
      
      this.$navLeft.on("click", function () {
         
         console.log("?left?");
         if (!ui.isDisabled()) {
            if (!instance.isStarted) {
               instance.start();
            } else {
               console.log("left");
               instance.carousel.navigateLeft();
            }
         }
      });
      this.$navRight.on("click", function () {
         
         if (!ui.isDisabled()) {
            if (!instance.isStarted) {
               instance.start();
            } else {
               instance.carousel.navigateRight();
            }
         }
      });
   },
   _bindStartFullscreenListener : function () {
      
      var instance = this;
      this.$image.on("click.Slideshow", function () {
         
         if (!main.getUI().isDisabled()) {
            instance.fullscreen.open();
         }
      });
   }

};
