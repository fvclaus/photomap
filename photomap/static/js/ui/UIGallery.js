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
   this.$inner = $('#mp-gallery-main');
   this.$hidden = $("#mp-gallery-thumbs");
   this.$galleryTiles = null;
   this.$elements = $(".mp-gallery-tile");
   this.$navLeft = $("#mp-gallery-nav-left");
   this.$navRight = $("#mp-gallery-nav-right");
   
   this.carousel = null;
   
   this.loaded = 0;
   this.photos = null;
   this.imageSources = [];
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
   },
   increaseLoaded : function () {
      this.loaded += 1;
   },
   getImageBySource : function (source) {
      
      return this.$inner.find("img[src='" + source + "']");
   },
   getImageIndex : function ($image) {
      
      var src = $image.attr("src");
      
      return this.$hidden.find("img[src='" + src + "']").index();
   },
   /**
    * @description Checks if current loaded photo is in the currrently visible gallery slider, if not gallery will move to containing slider
    */
   checkSlider : function () {
      
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
   /**
    * @description adds new photo to gallery.
    */
   insertPhoto : function (photo) {
      // insert hidden thumb
      this._appendImages([photo.thumb]);
      // update carousel
      this.imageSources = this.imageSources.filter(function (src) {
         return src !== null;
      });
      this.imageSources.push(photo.thumb);
      this.carousel.reinitialise(this.imageSources);
      // navigate to new image
      this._navigateToLastPage();
   },
   /**
    * @description removes image from gallery.
    */
   deletePhoto : function (photo) {
      
      var reload, instance = this;
      
      // delete hidden thumb
      this.$hidden.find("img[src='" + photo.thumb + "']").remove();
      // update carousel
      this.imageSources = this.imageSources.filter(function (src) {
         return src !== photo.thumb;
      });
      this.carousel.reinitialise(instance.imageSources);
      // visualise delete
      this.$inner.find("img[src='" + photo.thumb + "']").fadeOut(500);
      
      reload = function () {
         instance.$inner.find("img[src='" + photo.thumb + "']").attr("src", null);
         instance.carousel.reloadCurrentPage();
      };
      // wait for visualisation to finish
      window.setTimeout(reload, 500);
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
   * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
   */
   start : function () {
      
      var photos, state, controls, photoMatrix, i, instance = this;
      state = main.getUIState();
      photos = state.getPhotos();
      controls = main.getUI().getControls();
      //reset this.imageSources
      this.imageSources = [];
      
      // this method is just called if the gallery changes -> full-gallery has to be changed as well
      this.destroyFullGallery();
      
      if (photos && photos.length !== 0) {
         
         this.photos = photos;
         
         i = 0;
         // disable ui while loading & show loader
         state.setAlbumLoading(true);
         main.getUI().disable();
         main.getUI().showLoading();
         
         while (i < photos.length) {
            
            if (photos[i] !== undefined) {
               
               instance.imageSources.push(photos[i].thumb);
               
               $('<img/>')
                  .load(instance._galleryLoader)
                  .attr('src', photos[i].thumb);
            }
            i++;
         }
      } else {
         state.setPhotos(null);
         this.carousel.reset();
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
         gallery._appendImages(gallery.imageSources);
         // initialize and start carousel
         gallery.carousel = new UICarousel(gallery.$inner, gallery.imageSources);
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
      
      this.$hidden.append(
         $.jqote('#hiddenPhotosTmpl', {
            sources: sources
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
      instance.$inner
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

      this.$inner
         .on('click.Gallery', ".mp-gallery-tile", function (event) {
            var $el = $(this).children();
            
            if (!main.getUI().isDisabled()) {
               
               console.log(instance.getImageIndex($el));
               state.setCurrentLoadedPhotoIndex(instance.getImageIndex($el));
               state.setCurrentLoadedPhoto(state.getPhotos()[instance.getImageIndex($el)]);
               
               main.getUI().getControls().getEditControls().hide(false);
               
               // starts little slideshow in gallery div
               main.getUI().getSlideshow().startSlider();
            }
         });
   }

};
