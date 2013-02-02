/*jslint */
/*global $, main, fileUpload, UICarousel */

"use strict";

/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 * @requires UICarousel
 */

var UIGallery;

UIGallery = function () {

   this.$container = $('#mp-gallery');
   this.$gallery = $('#mp-gallery-main');
   this.$hiddenThumbs = $("#mp-gallery-thumbs");
   this.$galleryTiles = null;
   this.$elements = $(".mp-gallery-tile");
   this.$navLeft = $("#mp-gallery-nav-left");
   this.$navRight = $("#mp-gallery-nav-right");
   
   this.carousel = null;
   
   this.visible = false;
   this.loaded = 0;
   this.photos = null;
   this.thumbSources = [];
   this.fullGalleryLoaded = false;
   this.changed = false;
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
   },
   setGalleryChanged : function (changed) {
      this.changed = changed;
   },
   increaseLoaded : function () {
      this.loaded += 1;
   },
   getImageBySource : function (source) {
      
      return this.$gallery.find("img[src='" + source + "']");
   },
   getImageIndex : function ($image) {
      
      var src = $image.attr("src");
      
      return this.$hiddenThumbs.find("img[src='" + src + "']").index();
   },
   /**
    * @description adds new photo to gallery.
    */
   insertImage : function (photo) {
      // insert hidden thumb
      this._appendImages(photo.thumb);
      // update carousel
      this.thumbSources.push(photo.thumb);
      this.carousel.reinitialize(this.thumbSources);
      // navigate to new image
      this._navigateToLastPage();
   },
   /**
    * @description removes image from gallery.
    */
   deleteImage : function (photo) {
      // delete hidden thumb
      this.$hiddenThumbs.find("img[src='" + photo.thumb + "']").remove();
      // update carousel
      this.thumbSources.filter(function (src) {
         return src !== photo.thumb;
      });
      this.carousel.reinitialise(this.thumbSources);
      // delete image in currently visible gallery-page
      this.$gallery.find("img[src='" + photo.thumb + "']").attr("src", null);
      this.$gallery.find("img[src='" + photo.thumb + "']").parent().addClass("mp-empty-tile");
   },
   /**
    * @description Checks if current loaded photo is in the currrently visible gallery slider, if not gallery will move to containing slider
    */
   checkSlider : function (dir) {
      
      var state, currentIndex, minIndex, maxIndex;
      
      state = main.getUIState();
      currentIndex = state.getCurrentLoadedPhotoIndex();
      minIndex = this.getImageIndex(this.$elements.first());
      maxIndex = this.getImageIndex(this.$elements.last());
      
      if (currentIndex < minIndex) {
         this._navigateLeft();
      } else if (currentIndex > minIndex) {
         this._navigateRight();
      }
   },
   scrollToLastSlider : function () {
      this._getScrollable().end();
   },
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
                  thumbSources: instance.thumbSources
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
         $(".mp-full-gallery").jScrollPane();
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
   * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
   */
   show : function (photos) {
      
      var state, controls, photoMatrix, i, instance = this;
      state = main.getUIState();
      controls = main.getUI().getControls();
      //reset this.thumbSources
      this.thumbSources = [];
      
      // this method is just called if the gallery changes -> full-gallery has to be changed as well
      this.destroyFullGallery();
      
      if (photos && photos.length !== 0) {
         
         state.setPhotos(photos);
         this.photos = photos;
         
         i = 0;
         // disable ui while loading & show loader
         state.setAlbumLoading(true);
         main.getUI().disable();
         main.getUI().showLoading();
         
         while (i < photos.length) {
            
            if (photos[i] !== undefined) {
               
               instance.thumbSources.push(photos[i].thumb);
               
               $('<img/>')
                  .load(instance._galleryLoader)
                  .attr('src', photos[i].thumb);
            }
            i++;
         }
      } else {
         state.setPhotos(null);
      }
   },
   /**
    * @private
    */
   _galleryLoader : function () {
      
      var gallery, state, photoMatrix;
      gallery = main.getUI().getGallery();
      state = main.getUIState();
      
      gallery.increaseLoaded();
      
      if (gallery.photos && gallery.loaded === gallery.photos.length) {
         
         //enable ui
         main.getUIState().setAlbumLoading(false);
         main.getUI().enable();
         
         // append loaded images to gallery (hidden)
         gallery._appendImages(gallery.thumbSources);
         // initialize and start carousel
         gallery.carousel = new UICarousel(gallery.$gallery, gallery.thumbSources);
         gallery.carousel.start();
         
         // reset loaded value
         gallery.loaded = 0;
         // hide loader
         main.getUI().hideLoading();
      }
   },
   /**
    * @private
    * @description appends any number (1->Inf) of thumbnails to gallery (hidden)
    */
   _appendImages : function (sources) {
      
      var instance = this;
      
      this.$hiddenThumbs.append(
         $.jqote('#galleryTmpl', {
            thumbSources: sources
         })
      );
   },
   /**
    * @private
    */
   _navigateLeft : function () {
      
      this.carousel.navigateLeft();
   },
   /**
    * @private
    */
   _navigateRight : function () {
      
      this.carousel.navigateRight();
   },
   /**
    * @private
    */
   _navigateToLastPage : function () {
      
      this.carousel.navigateTo("end");
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
   
   /* ---- Listeners ---- */
   
   _bindNavigationListener : function () {
      
      var instance = this;
      
      this.$navLeft.on("click", function () {
         
         if (!main.getUI().isDisabled()) {
            instance._navigateLeft();
         }
      });
      this.$navRight.on("click", function () {
         
         if (!main.getUI().isDisabled()) {
            instance._navigateRight();
         }
      });
   },
   
   _bindListener : function () {

      var state, tools, controls, authorized, photo, instance = this;
      state = main.getUIState();
      controls = main.getUI().getControls();
      authorized = main.getClientState().isAdmin();
      tools = main.getUI().getTools();
      
      //bind events on anchors
      instance.$gallery
         .on('mouseenter.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            
            if (!main.getUI().isDisabled()) {
               
               photo = $.grep(state.getPhotos(), function (e, i) {
                  return e.thumb === $el.attr("src");
               })[0];
               state.setCurrentPhotoIndex(instance.getImageIndex($el));
               state.setCurrentPhoto(photo);
               
               if (authorized) {
                  controls.setModifyPhoto(true);
                  controls.getEditControls().showPhotoControls($el);
               }
            }
         })
         .on('mouseleave.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            
            if (!main.getUI().isDisabled()) {
            
               if (authorized) {
                  controls.getEditControls().hide(true);
               }
            }
         });
      
      
   },
   /**
    * @private
    */
   _bindStartSlideshowListener : function () {
      
      var state, controls, authorized, photo, instance = this;
      state = main.getUIState();
      controls = main.getUI().getControls();
      authorized = main.getClientState().isAdmin();

      this.$gallery
         .on('click.Gallery', ".mp-gallery-tile", function (event) {
            var $el = $(this).children();
            
            if (!main.getUI().isDisabled()) {
               
               
               state.setCurrentLoadedPhotoIndex(instance.getImageIndex($el));
               state.setCurrentLoadedPhoto(state.getPhotos()[instance.getImageIndex($el)]);
               
               main.getUI().getControls().getEditControls().hide(false);
               
               // starts little slideshow in gallery div
               main.getUI().getSlideshow().startSlider();
            }
         });
   }

};
