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
            
            if (instance.$image.is(":visible")) {
               instance.$image.hide();
            }

            $('<img/>').load(function () {
               if (state.getCurrentLoadedPhoto()) {
                  state.getCurrentLoadedPhoto().showBorder(true);
               }
               instance.$image.load(function () {
                  
                  //center in the middle
                  tools.centerElement(instance.$wrapper, instance.$image);

                  instance.$image.fadeIn(300);

                  state.setSlideshowLoaded(true);
               });
               instance.$image.attr('src', state.getCurrentLoadedPhoto().source);
            
            }).attr('src', state.getCurrentLoadedPhoto().source);
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
      
      var state, gallery, currentPhotoIndex, currentPhoto, photos;
      state = main.getUIState();
      gallery = main.getUI().getGallery();
      currentPhotoIndex = state.getCurrentLoadedPhotoIndex();
      currentPhoto = state.getCurrentLoadedPhoto();
      photos = state.getPhotos();

      if (dir === 'right') {
         if (currentPhotoIndex + 1 < photos.length) {
            state.setCurrentLoadedPhotoIndex(++currentPhotoIndex);
         } else if (photos.length > 0) {
            state.setCurrentLoadedPhotoIndex(0);
         } else {
            state.setCurrentLoadedPhotoIndex(0);
            state.setCurrentLoadedPhoto(null);
            return;
         }
      } else if (dir === 'left') {
         if (currentPhotoIndex - 1 >= 0) {
            state.setCurrentLoadedPhotoIndex(--currentPhotoIndex);
         } else if (photos.length > 0) {
            state.setCurrentLoadedPhotoIndex(photos.length - 1);
         } else {
            state.setCurrentLoadedPhotoIndex(0);
            state.setCurrentLoadedPhoto(null);
            return;
         }
      }
      state.setCurrentLoadedPhoto(photos[state.getCurrentLoadedPhotoIndex()]);
      gallery.checkSlider();
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
   bindListener : function () {
      var instance = this;
      //bind slideshow button listener

      this.$next.on('click.Slideshow', function () {
         if ($(this).hasClass("disabled")) {
            return;
         }
         instance.navigateSlider(instance, 'right');
      });

      this.$prev.on('click.Slideshow', function () {
         instance.navigateSlider(instance, 'left');
      });

      this.$zoom.on("click.Slideshow", function () {
         if ($(this).hasClass("disabled")) {
            return;
         }
         main.getUI().getFullscreen().zoom();
      });
   }

};
