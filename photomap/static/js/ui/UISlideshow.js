/*jslint */
/*global $, main, UICarousel, UIFullscreen */

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
   this.$image = $("img#mp-slideshow-image");
   this.$hidden = $("#mp-slideshow-photos");
   this.$navLeft = $('img#mp-slideshow-nav-prev');
   this.$navRight = $('img#mp-slideshow-nav-next');
   
   this.carousel = null;
   this.fullscreen = new UIFullscreen(this);
   
   this.isStarted = false;
   this.imageSources = [];
};

UISlideshow.prototype = {

   initWithoutAjax : function () {
      this._bindNavigationListener();
      this._bindStartFullscreenListener();
   },
   getCarousel : function () {
      return this.carousel;
   },
   insertPhoto : function (photo) {
      
      if (this.isStarted) {
         // insert hidden thumb
         this.appendImages([photo.photo]);
         // update carousel
         this.imageSources = this.imageSources.filter(function (src) {
            return src !== null;
         });
         this.imageSources.push(photo.photo);
         this.carousel.reinitialise(this.imageSources);
         this.carousel.navigateTo("end");
      } else {
         this.start("end");
      }
         
   },
   deletePhoto : function (photo) {
      
      var state = main.getUIState(),
         reload,
         instance = this;
      
      // delete hidden thumb
      this.$hidden.find("img[src='" + photo.photo + "']").remove();
      // update carousel
      this.imageSources = this.imageSources.filter(function (src) {
         return src !== photo.photo;
      });
      this.carousel.reinitialise(instance.imageSources);
      // visualise delete (if photo was loaded)
      if (photo === state.getCurrentLoadedPhoto()) {
         this.$image.fadeOut(500);
         
         reload = function () {
            instance.carousel.navigateRight();
         };
         // wait for visualisation to finish
         window.setTimeout(reload, 500);
      }
   },
   /**
    * @description appends any number (1->Inf) of thumbnails to slideshow (hidden)
    */
   appendImages : function (sources) {
      
      var instance = this,
         images = this.$hidden.find("img"),
         data = [],
         tmplData = [],
         i;
      
      images.each(function () {
         
         data.push($(this).attr("src"));
      });
      
      for (i = 0; i <= sources.length; i++) {
         
         if (i === sources.length) {
            
            if (tmplData.length > 0) {
               
               this.$hidden.append(
                  $.jqote('#hiddenPhotosTmpl', {
                     sources: tmplData
                  })
               );
            }
         } else {
            if ($.inArray(sources[i], data) === -1) {
               tmplData.push(sources[i]);
            }
         }
      }
   },
   /**
    * @description starts slideshow by initialising and starting the carousel (with given index)
    */
   start: function (index) {
      var instance = this,
         ui = main.getUI(),
         state = ui.getState(),
         photos = state.getPhotos(),
         options;
      
      $(".mp-slideshow-no-image-msg").hide();
      
      photos.forEach(function (photo, index) {
         if (photo !== undefined) {
            instance.imageSources.push(photo.photo);
         }
      });
      // initialize and start carousel
      options = {
         lazy : true,
         effect : "fade",
         onLoad : instance._load,
         onUpdate : instance._update
      };
      this.carousel = new UICarousel(this.$inner, this.imageSources, options);
      this.carousel.start(index);
      
      this.isStarted = true;
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
   
      slideshow.setCurrentLoadedPhoto();
      description.updatePhoto();
      $("#mp-content").trigger("slideshowChanged");
   },
   /**
    * @private
    * @description handler is called after slideshow-image is loaded
    */
   _load : function () {
      
      var ui = main.getUI(),
         state = ui.getState(),
         description = ui.getInformation(),
         slideshow = ui.getSlideshow();
      
      state.setSlideshowLoaded(true);
      slideshow.appendImages(slideshow.getCarousel().getLoadedData());
   },
   setCurrentLoadedPhoto : function () {
      
      var ui = main.getUI(),
         state = main.getUIState(),
         photos = state.getPhotos(),
         currentPhoto = ui.getTools().getObjectByKey("photo", this.$image.attr("src"), photos),
         currentIndex = $.inArray(currentPhoto, photos);
      
      state.setCurrentLoadedPhoto(currentPhoto);
      state.setCurrentLoadedPhotoIndex(currentIndex);
   },
   _navigateLeft : function () {
      this.$navLeft.trigger("click");
   },
   _navigateRight : function () {
      this.$navRight.trigger("click");
   },
   /* ---- Listeners ---- */
   _bindNavigationListener : function () {
      
      var disabled = main.getUI().isDisabled(),
         instance = this;
      
      this.$navLeft.on("click", function () {
         
         if (!disabled) {
            if (!instance.isStarted) {
               instance.start();
            } else {
               instance.carousel.navigateLeft();
            }
         }
      });
      this.$navRight.on("click", function () {
         
         if (!disabled) {
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
            instance.fullscreen.zoom();
         }
      });
   }

};
