/*jslint */
/*global $, main, fileUpload, UIPhotoCarousel */

"use strict";

/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 * @requires UICarousel
 */

var UIGallery;

UIGallery = function () {

   this.$container = $('#mp-gallery');
   this.$inner = $('#mp-gallery-inner');
   // this.$hidden = $("#mp-gallery-thumbs");
   this.$thumbs = $(".mp-gallery-tile");
   this.$navLeft = $("#mp-gallery-nav-left");
   this.$navRight = $("#mp-gallery-nav-right");
   this.$photos = this.$thumbs.find(".mp-thumb");
   
   this.carousel = null;
   
   this.photos = null;
   this.isStarted = false;
   this.fullGalleryLoaded = false;
};

UIGallery.prototype =  {

   initAfterAjax : function () {
      var controls = main.getUI().getControls();
      if (main.getClientState().isAdmin()) {
         this.$container.bind('dragover.FileUpload', controls.handleGalleryDragover);
         this.$container.bind('drop.FileUpload', controls.handleGalleryDrop);
         this._bindListener();
      }
      this._bindNavigationListener();
      this._bindStartSlideshowListener();
      this._bindSlideshowNavigationListener();
   },
   getImageBySource : function (source) {
      return this.$inner.find("img[src='" + source + "']");
   },
   _getIndexOfImage : function ($image) {
      return this.carousel.getAllImageSources().indexOf($image.attr("src"));
   },
   getCarousel : function () {
      return this.carousel;
   },
   _getIndexOfFirstThumbnail : function () {
      return this._getIndexOfImage(this.$photos.first());
   },
   _getIndexOfLastThumbnail : function () {
      return this._getIndexOfImage(this.$photos.filter(":[src]").last());
   },
   /**
    * @description Checks if current loaded photo is in the currrently visible gallery slider, if not gallery will move to containing slider
    */
   _checkSlider : function () {
      
      var currentIndex = main.getUIState().getCurrentLoadedPhotoIndex(),
          minIndex = this._getIndexOfFirstThumbnail(),
          maxIndex = this._getIndexOfLastThumbnail();
      
      if (currentIndex < minIndex) {
         this.$navLeft.trigger("click");
      } else if (currentIndex > maxIndex) {
         this.$navRight.trigger("click");
      }
   },
   /**
    * @description adds new photo to gallery.
    */
   insertPhoto : function (photo) {
      
      // this.imageSources.push(photo.thumb);
      // automatically adds the photo if we are on last page
      this.carousel.insertPhoto(photo.thumb);

      // navigate to the picture if we are not on the last page
      if (this.isStarted && !this.carousel.isLastPage()) {
         this._navigateToLastPage();
      } else {
         // show the new photo
         //TODO this does now show the new photo yet
         this.start();
      }
         
   },
   /**
    * @description removes image from gallery.
    */
   deletePhoto : function (photo) {
      // automatically delete if photo is on current page
      // otherwise we dont care
      this.carousel.deletePhoto(photo.thumb);
   },

  /**
   * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
   */
   start : function () {
      
      var ui = main.getUI(),
          state = ui.getState(),
          photos = state.getPhotos(),
          options,
          instance = this,
          imageSources = [];

      this.isStarted = true;
      
      // reset FullGallery
      this.destroyFullGallery();

      // initialize and start carousel
      options = {
         lazy : !main.getClientState().isAdmin(),
         effect : "foldIn",
         beforeLoad : this._beforeLoad,
         afterLoad : this._afterLoad
      };
      photos.forEach(function (photo, index) {
         imageSources.push(photo.thumb);
      });
      this.carousel = new UIPhotoCarousel(this.$inner.find("img.mp-thumb"), imageSources, options);
      
      if (photos.length !== 0) {
         // disable ui while loading & show loader
         state.setAlbumLoading(true);
         ui.disable();
         // ui.showLoading();
         this.carousel.start();
      }
   },
   reset : function () {
      
      this.isStarted = false;
      if (this.carousel !== null) {
         this.carousel.reset();
         this.carousel = null;
      }
   },
   /**
    * @private
    * @description handler is called after gallery-thumbs are loaded
    */
   _beforeLoad : function ($photos) {
      var ui = main.getUI();
      
      //enable ui
      ui.enable();
      //TODO show loading
      $photos.each(function () {
         $(this)
            .hide()
            .siblings(".mp-gallery-loader")
            .show();
      });
      // hide loader
      // ui.hideLoading();
   },
   _afterLoad : function ($photos) {
      //TODO hide loading
      $photos.each(function () {
         $(this)
            .siblings(".mp-gallery-loader")
            .hide();
      });
   },
   /**
    * @private
    */
   _navigateToLastPage : function () {
      
      this.carousel.navigateTo("end");
   },

   
   /* ---- Listeners ---- */
   
   _bindNavigationListener : function () {
      
      var ui = main.getUI(),
         instance = this;
      
      this.$navLeft.on("click", function () {
         
         if (!ui.isDisabled()) {
            instance.carousel.navigateLeft();
         }
      });
      this.$navRight.on("click", function () {
         
         if (!ui.isDisabled()) {
            instance.carousel.navigateRight();
         }
      });
   },
   
   _bindListener : function () {

      var ui = main.getUI(),
         state = ui.getState(),
         tools = ui.getTools(),
         controls = ui.getControls(),
         authorized = main.getClientState().isAdmin(),
         photo,
         instance = this;
      
      //bind events on anchors
      instance.$inner
         .on('mouseenter.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            
            if (!ui.isDisabled()) {
               
               photo = $.grep(state.getPhotos(), function (e, i) {
                  return e.thumb === $el.attr("src");
               })[0];
               state.setCurrentPhoto(photo);
               
               if (authorized) {
                  controls.setModifyPhoto(true);
                  controls.getEditControls().showPhotoControls($el);
               }
            }
         })
         .on('mouseleave.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            
            if (!ui.isDisabled()) {
            
               if (authorized) {
                  controls.getEditControls().hide(true);
               }
            }
         });
      
      
   },
   /**
    * @private
    * @description binds listener to custom event "slideshowChanged" which is triggered each time the slideshow is updated. In case the current image in
    * the slideshow is not visible in the gallery anymore the gallery-carousel has to be updated as well!
    */
   _bindSlideshowNavigationListener : function () {
      
      var instance = this;
      
      $("#mp-content").on("slideshowChanged", function () {
         instance._checkSlider();
      });
   },
   /**
    * @private
    */
   _bindStartSlideshowListener : function () {
      
      var ui = main.getUI(),
         instance = this;
      
      this.$inner
         .on('click.Gallery', ".mp-gallery-tile", function (event) {
            
            var $el = $(this).children();
            
            if (!ui.isDisabled()) {
               ui.getControls().getEditControls().hide(false);
               ui.getSlideshow().navigateTo(instance._getIndexOfImage($el));
            }
         });
   },

   /** FULL_GALLERY_START */
   startFullGallery : function () {
      var photos, $container, instance = this;
      photos = main.getUIState().getPhotos();
      $container = $("#mp-full-left-column");
      
      if (photos) {
         
         $container
            .find(".mp-data")
            .addClass("mp-full-gallery")
            .append(
               $.jqote('#fullGalleryTmpl', {
                  thumbSources: instance.imageSources
               })
            );
         
         this._initializeSortable();
         this.fullGalleryLoaded = true;
      }
   },
   destroyFullGallery : function () {
      
      var $container = $("#mp-full-left-column");
      
      $(".mp-full-gallery").sortable("destroy");
      $container
         .find(".mp-data")
         .empty()
         .removeClass("mp-full-gallery");
      if (!$container.hasClass("mp-nosdisplay")) {
         $container.addClass("mp-nodisplay");
      }
      this.fullGalleryLoaded = false;
   },
   showFullGallery : function () {
      
      if (!this.fullGalleryLoaded) {
         this.startFullGallery();
         //TODO Das geht noch nicht.
//         $(".mp-full-gallery").jScrollPane();
      }
      $("#mp-full-left-column").removeClass("mp-nodisplay");
   },
   hideFullGallery : function () {
      
      $("#mp-full-left-column").addClass("mp-nodisplay");
      if (this.changed) {
         main.getUIState().getCurrentPlace().triggerDoubleClick();
         this.changed = false;
      }
   },
   /**
    * @private
    */
   _initializeSortable : function () {
      
      var $fullGallery, $currentTile, jsonPhotos, jsonPhoto, state, instance = this;
      state = main.getUIState();
      $fullGallery = $(".mp-full-gallery");
      
      $(".mp-sortable-tile").on("click.UIDisabled", function () {
         if (main.getUI().isDisabled()) {
            return false;
         }
      });
      $fullGallery
         .sortable({
            items : ".mp-sortable-tile",
            update : function (event, ui) {
               jsonPhotos = [];

               state.getPhotos().forEach(function (photo, index, photos) {
                  // get html tag for tile containing current photo
                  $currentTile = $fullGallery.find('img[src="' + photo.thumb + '"]').parent();
                  // find index of current photo in gallery
                  console.log(photo.order);
                  photo.order = $fullGallery.children().index($currentTile);
                  console.log(photo.order);
                  // make a deep copy
                  jsonPhoto = $.extend(true, {}, photo);
                  jsonPhotos.push(jsonPhoto);
                  // when all photos with new order are in jsonPhotos, save the order
                  if (index === photos.length - 1) {
                     main.getClientServer().savePhotoOrder(jsonPhotos);
                  }
               });
            }
         });
   },

};
