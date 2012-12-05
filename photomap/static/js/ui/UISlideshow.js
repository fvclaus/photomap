/*jslint */
/*global $, main */

"use strict";

/**
 * @author Frederik Claus
 * @class UISlideshow displays the current selected Photo in the Slideshow
 */

var UISlideshow;

UISlideshow = function () {

   this.$slideshow = $('#mp-slideshow');
   this.$nav = this.$slideshow.find("div.mp-slideshow-nav");
   this.$next = this.$slideshow.find('img.mp-slideshow-nav-next');
   this.$prev = this.$slideshow.find('img.mp-slideshow-nav-prev');
   this.$image = this.$slideshow.find("img.mp-current-image");
   this.$loading = this.$slideshow.find('img.mp-image-loading-small');
   this.$zoom = this.$slideshow.find("img.mp-slideshow-zoom");
   this.$wrapper = this.$slideshow.find("div.mp-slideshow-image");
};

UISlideshow.prototype = {

   initWithoutAjax : function () {
      this.bindListener();
      this.positionNavigation();
   },
   positionNavigation : function () {
      
      var tools = main.getUI().getTools();
      
      tools.centerElement(this.$nav.first(), this.$prev);
      tools.centerElement(this.$nav.first(), this.$next);
   },
   startSlider: function () {
      
      var state, information, tools, cursor, updateImage, once, instance = this;
      state = main.getUIState();
      information = main.getUI().getInformation();
      tools = main.getUI().getTools();
      cursor = main.getUI().getCursor();
      once = false;
      
      updateImage = function () {
         if (!once) {
            
            once = true;
            
            $('<img/>').load(function () {
               if (state.getCurrentPhoto()) {
                  state.getCurrentPhoto().showBorder(true);
               }
               instance.$image.load(function () {
                  //center in the middle
                  instance.$image.show();
                  tools.centerElement(instance.$wrapper, instance.$image);
                  instance.$image.hide();

                  instance.$image.fadeIn(300, function () {
                     //instance.album.enableGallery();
                  });

                  state.setSlideshowLoaded(true);
               });
               instance.$image.attr('src', state.getCurrentPhoto().source);
               instance._bindFullscreenListener();
               
            }).attr('src', state.getCurrentPhoto().source);
         } else {
            return;
         }
      };

      updateImage();
      // sets Photo title in album title bar and  Photo description + number
      information.updatePhoto();
      // set cursor for fullscreen control
      cursor.setCursor($(".mp-album-zoom"), cursor.styles.pointer);
   },

   navigateSlider : function (instance, dir) {
      
      var state, currentPhotoIndex, currentPhoto, photos;
      state = main.getUIState();
      currentPhotoIndex = state.getCurrentPhotoIndex();
      currentPhoto = state.getCurrentPhoto();
      photos = state.getPhotos();

      if (dir === 'right') {
         if (currentPhotoIndex + 1 < photos.length) {
            state.setCurrentPhotoIndex(++currentPhotoIndex);
         } else if (photos.length > 0) {
            state.setCurrentPhotoIndex(0);
         } else {
            state.setCurrentPhotoIndex(0);
            state.setCurrentPhoto(null);
            return;
         }
      } else if (dir === 'left') {
         if (currentPhotoIndex - 1 >= 0) {
            state.setCurrentPhotoIndex(--currentPhotoIndex);
         } else if (photos.length > 0) {
            state.setCurrentPhotoIndex(photos.length - 1);
         } else {
            state.setCurrentPhotoIndex(0);
            state.setCurrentPhoto(null);
            return;
         }
      }
      state.setCurrentPhoto(photos[state.getCurrentPhotoIndex()]);
      this.startSlider();
   },

   disableControls : function () {
      this.$next.addClass("disabled");
      this.$prev.addClass("disabled");
      this.$close.addClass("disabled");
   },
   enableControls : function () {
      this.$next.removeClass("disabled");
      this.$prev.removeClass("disabled");
      this.$close.removeClass("disabled");
   },

   /* ---- Listeners ---- */
   _bindFullscreenListener : function () {
      //problem: every time the slider is started the events get bound and get fired several times
      //unbind all events first, then bind a new one
      var tools, instance = this;
      tools = main.getUI().getTools();
      
      instance.$image
         .unbind(".GalleryZoom")
         .bind("mouseover.GalleryZoom", function () {
            if (main.getUIState().isSlideshowLoaded()) {
               tools.centerElement(instance.$image, instance.$zoom);
               instance.$zoom.show();
            }
         })
         .bind("mouseleave.GalleryZoom", function () {
            instance.$zoom.hide();
         });
   },
   bindListener : function () {
      var instance = this;
      //bind slideshow button listener

      this.$next.bind('click.Slideshow', function () {
         if ($(this).hasClass("disabled")) {
            return;
         }
         instance.navigateSlider(instance, 'right');
      });

      this.$prev.bind('click.Slideshow', function () {
         if ($(this).hasClass("disabled")) {
            return;
         }
         instance.navigateSlider(instance, 'left');
      });

      this.$zoom
         .bind("mouseover.Slideshow", function () {
            if (main.getUIState().isSlideshowLoaded()) {
               $(this)
                  .show()
                  .css("opacity", ".7");
            }
         })
         .bind("click.Slideshow", function () {
            $(this).hide();
            main.getUI().getFullscreen().zoom();
         })
         .bind("mouseleave.Slideshow", function () {
            $(this).css("opacity", ".4");
         });
   }

};
