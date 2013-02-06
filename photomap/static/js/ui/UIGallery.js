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
   
   this.photos = null;
   this.imageSources = [];
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
   },
   getImageBySource : function (source) {
      
      return this.$inner.find("img[src='" + source + "']");
   },
   getImageIndex : function ($image) {
      
      var src = $image.attr("src");
      return this.$hidden.find("img[src='" + src + "']").index();
   },
   getCarousel : function () {
      return this.carousel;
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
      
      if (this.isStarted) {
         // insert hidden thumb
         this.appendImages([photo.thumb]);
         // update carousel
         this.imageSources = this.imageSources.filter(function (src) {
            return src !== null;
         });
         this.imageSources.push(photo.thumb);
         this.carousel.reinitialise(this.imageSources);
         // navigate to new image
         this._navigateToLastPage();
      } else {
         this.start();
      }
         
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
    * @description appends any number (1->Inf) of thumbnails to gallery (hidden)
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
   * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
   */
   start : function () {
      
      var ui = main.getUI(),
         state = ui.getState(),
         options,
         photoMatrix,
         i,
         instance = this;
      
      //get photos
      this.photos = state.getPhotos();
      //reset this.imageSources
      this.imageSources = [];
      // reset FullGallery
      this.destroyFullGallery();
      
      if (this.photos && this.photos.length !== 0) {
         
         // disable ui while loading & show loader
         state.setAlbumLoading(true);
         ui.disable();
         ui.showLoading();
         
         for (i = 0; i < this.photos.length; i++) {
            
            if (this.photos[i] !== undefined) {
               instance.imageSources.push(this.photos[i].thumb);
            }
         }
         // initialize and start carousel
         options = {
            lazy : !main.getClientState().isAdmin(),
            effect : "foldIn",
            onLoad : instance._load
         };
         this.carousel = new UICarousel(instance.$inner, instance.imageSources, options);
         this.carousel.start();
         
         this.isStarted = true;
      
      } else {
         
         this.isStarted = false;
         if (this.carousel !== null) {
            this.carousel.reset();
         }
      }
   },
   /**
    * @private
    */
   _load : function () {
      var ui = main.getUI(),
         gallery = ui.getGallery(),
         state = ui.getState();
      
      //enable ui
      state.setAlbumLoading(false);
      ui.enable();
      
      // append loaded images to gallery (hidden)
      gallery.appendImages(gallery.getCarousel().getLoadedData());
      
      // hide loader
      ui.hideLoading();
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
      
      var disabled = main.getUI().isDisabled(),
         instance = this;
      
      this.$navLeft.on("click", function () {
         
         if (!disabled) {
            instance.carousel.navigateLeft();
         }
      });
      this.$navRight.on("click", function () {
         
         if (!disabled) {
            instance.carousel.navigateRight();
         }
      });
   },
   
   _bindListener : function () {

      var ui = main.getUI(),
         state = ui.getState(),
         tools = ui.getTools(),
         controls = ui.getControls(),
         disabled = ui.isDisabled(),
         authorized = main.getClientState().isAdmin(),
         photo,
         instance = this;
      
      //bind events on anchors
      instance.$inner
         .on('mouseenter.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            
            if (!disabled) {
               
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
            
            if (!disabled) {
            
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
      
      var ui = main.getUI(),
         state = ui.getState(),
         photo,
         instance = this;
      
      this.$inner
         .on('click.Gallery', ".mp-gallery-tile", function (event) {
            var $el = $(this).children();
            
            if (!ui.isDisabled()) {
               
               state.setCurrentLoadedPhotoIndex(instance.getImageIndex($el));
               state.setCurrentLoadedPhoto(state.getPhotos()[instance.getImageIndex($el)]);
               console.log((state.getPhotos()[instance.getImageIndex($el)]));
               ui.getControls().getEditControls().hide(false);
               
               ui.getSlideshow().startSlider();
            }
         });
   }

};
