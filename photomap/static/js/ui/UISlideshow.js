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
   this.$next = this.$slideshow.find('img.mp-album-nav-next');
   this.$prev = this.$slideshow.find('img.mp-album-nav-prev');
   this.$close = this.$slideshow.find('img.mp-slideshow-close');
   this.$image = this.$slideshow.find("div.mp-album-image > img[class!='mp-album-zoom']");
   this.$loading = this.$slideshow.find('img.mp-image-loading-small');
   this.$zoom = this.$slideshow.find("img.mp-album-zoom");
   this.$wrapper = this.$slideshow.find("div.mp-album-image");
};

UISlideshow.prototype = {

   initWithoutAjax : function () {
      this.bindListener();
   },
   startSlider: function () {
      
      var state, information, cursor, updateImage, once, instance = this;
      state = main.getUIState();
      information = main.getUI().getInformation();
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
                  instance.$wrapper
                     .css("padding-top", (instance.$slideshow.height() - instance.$image.height()) / 2);
                  instance.$image.hide();

                  instance.$image.fadeIn("slow", function () {
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

      // sets Photo title in album title bar and  Photo description + number
      information.updatePhoto();
      // set cursor for fullscreen control
      cursor.setCursor($(".mp-album-zoom"), cursor.styles.pointer);
   },

   _navigateSlider : function (instance, dir) {
      
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
      var instance = this;
      instance.$image
         .unbind(".GalleryZoom")
         .bind("mouseover.GalleryZoom", function () {
            if (main.getUIState().isSlideshowLoaded()) {
               var position = {
                  top : parseInt(instance.$wrapper.css("padding-top")),
                  left : instance.$image.position().left
               };
               instance.$zoom
                  .css("left", position.left + instance.$image.width() / 2 - instance.$zoom.width() / 2)
                  .css("top", position.top + instance.$image.height() / 2 - instance.$zoom.height() / 2)
                  .show();
            }
         })
         .bind("mouseleave.GalleryZoom", function () {
            instance.$zoom.hide();
         });
   },
   bindListener : function () {
      var instance = this;
      //bind slideshow button listener
      this.$close.bind('click.Gallery', function () {
         if ($(this).hasClass("disabled")) {
            return;
         }
         instance.closeSlideshow();
      });

      this.$next.bind('click.Gallery', function () {
         if ($(this).hasClass("disabled")) {
            return;
         }
         instance._navigateSlider(instance, 'right');
      });

      this.$prev.bind('click.Gallery', function () {
         if ($(this).hasClass("disabled")) {
            return;
         }
         instance._navigateSlider(instance, 'left');
      });

      this.$zoom
         .bind("mouseover.Gallery", function () {
            if (main.getUIState().isSlideshowLoaded()) {
               $(this)
                  .show()
                  .css("opacity", ".7");
            }
         })
         .bind("click.Gallery", function () {
            $(this).hide();
            main.getUI().getFullscreen().zoom();
         })
         .bind("mouseleave.Gallery", function () {
            $(this).css("opacity", ".4");
         });
   }

};
