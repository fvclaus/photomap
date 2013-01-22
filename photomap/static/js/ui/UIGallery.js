/*jslint */
/*global $, main, fileUpload */

"use strict";

/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 */

var UIGallery;

UIGallery = function () {

   this.$container = $('#mp-gallery');
   this.$mainWrapper = $('#mp-gallery-main');
   this.$galleryWrapper = $('#mp-gallery-outer');
   this.$gallery = $('#mp-gallery-inner');
   this.$galleryPages = null;
   this.$galleryTiles = null;
   this.$elements = null;
   
   this.visible = false;
   this.loaded = 0;
   this.photos = null;
   this.tmplPhotosData = [];
   this.fullGalleryLoaded = false;
   this.changed = false;
};

UIGallery.prototype =  {

   initAfterAjax : function () {
      if (main.getClientState().isAdmin()) {
         this.$container.bind('dragover.FileUpload', fileUpload.handleGalleryDragover);
         this.$container.bind('drop.FileUpload', fileUpload.handleGalleryDrop);
         this._bindListener();
      }
      this._bindStartSlideshowListener();
   },
   setGalleryChanged : function (changed) {
      this.changed = changed;
   },
   /**
    * @author Frederik Claus
    * @description Reselect all images in the gallery. This is necessary when the gallery gets updated
    * @private
    */
   _searchImages : function () {
      this.$elements = this.$gallery.find('div.mp-gallery > img').not(".mp-controls-options");
      this.$galleryPages =  this.$gallery.find('.mp-thumb-page');
      this.$galleryTiles = this.$gallery.find('.mp-gallery-tile');
   },
   getImageBySource : function (source) {
      
      // due to the way .scrollable() works each img is 3 times in Gallery -> you need to pic the second, which is the currently visible 
      return this.$gallery.find("img[src='" + source + "']").eq(1);
   },
   getImageIndex : function ($image) {
      
      var sliderIndex, imageIndex;
      
      sliderIndex = this._getScrollable().getIndex();
      imageIndex = $image.parent().index();
      
      return sliderIndex * 5 + imageIndex;
   },
   /**
    * @private
    */
   _getScrollable : function () {
      return this.$container.data('scrollable');
   },
   /**
    * @description Checks if current loaded photo is in the currrently visible gallery slider, if not gallery will move to containing slider
    */
   checkSlider : function () {
      
      var state, photo, currentIndex, sliderIndex, newSliderIndex, indexInSlider;
      
      state = main.getUIState();
      photo = state.getCurrentLoadedPhoto();
      currentIndex = state.getCurrentLoadedPhotoIndex();
      sliderIndex = this._getScrollable().getIndex();
      
      indexInSlider = currentIndex > sliderIndex * 5 && currentIndex < sliderIndex * 5 + 5;
      if (!indexInSlider) {
         newSliderIndex = Math.floor(currentIndex / 5);
         this._getScrollable().seekTo(newSliderIndex);
      }
   },
   startFullGallery : function () {
      var photos, $container, instance = this;
      photos = main.getUIState().getPhotos();
      $container = $("#mp-full-left-column");
      
      if (photos) {
         photos.forEach(function (photo) {
            instance.tmplPhotosData.push(photo.thumb);
         });
         
         $container
            .find(".mp-data")
            .addClass("mp-full-gallery")
            .append(
               $.jqote('#fullGalleryTmpl', {
                  thumbAddress: instance.tmplPhotosData
               })
            );
         this._initializeSortable();
         this.tmplPhotosData = [];
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
//         $(".mp-full-gallery").jScrollPane();
      }
      $("#mp-full-left-column").removeClass("mp-nodisplay");
      this._centerImages();
      
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
      
      
      // this method is just called if the gallery changes -> full-gallery has to be changed as well
      this.destroyFullGallery();
      
      if (photos && photos.length !== 0) {
         
         state.setPhotos(photos);
         this.photos = photos;
         
         i = 0;
         // disable ui while loading & show loader
         state.setAlbumLoading(true);
         main.getUI().disable();
         //main.getUI().showLoading();
         // empty gallery and reposition it to 0
         this.$gallery.empty().css("left", 0);
         
         while (i < photos.length) {
            
            if (photos[i] !== undefined) {
               
               instance.tmplPhotosData.push(photos[i].thumb);
               $('<img/>')
                  .load(instance._galleryLoader)
                  .attr('src', photos[i].thumb);
            }
            i++;
         }
      } else {
         state.setPhotos(null);
         // create empty gallery -> b clicking on empty tile you can add photo
         this.$gallery.empty().css("left", 0);
         this._createEmptyTiles();
         this._resizeTiles();
      }
   },
   /**
    * @private
    */
   _galleryLoader : function () {
      
      var gallery, photoMatrix;
      gallery = main.getUI().getGallery();
      
      gallery.loaded += 1;
      
      if (gallery.photos && gallery.loaded === gallery.photos.length) {
         
         // enable ui & hide loader
         main.getUIState().setAlbumLoading(false);
         main.getUI().enable();
         //main.getUI().hideLoading();
         // create a matrix with 6 columns out of the photos-Array and display each row in a separate div
         photoMatrix = main.getUI().getTools().createMatrix(gallery.photos, 5);
         gallery._appendImages(photoMatrix, gallery.tmplPhotosData);
         // fill last slider up with empty tiles (unless it is already filled with pics)
         gallery._createEmptyTiles();
         //search all anchors
         gallery._searchImages();
         // adjust height to make the thumbs square
         gallery._resizeTiles();
         // initialize scrollable
         gallery._initializeScrollable();
         
         gallery._centerImages();
         
         // reset loading values to 0 / null
         gallery.loaded = 0;
         gallery.tmplPhotosData = [];
      }
   },
   /**
    * @private
    */
   _resizeTiles : function () {
      
      var width, height, margin;
      
      width = this.$container.innerWidth() * (120 / 780) - 10;
      height = this.$container.innerHeight() * (240 / 280) - 10;
      margin = this.$container.innerWidth() * (10 / 780);
      
      this.$galleryTiles.css({
         width: width,
         height: height,
         padding: "5px",
         marginRight: margin
      });
   },
   /**
    * @private
    */
   _createEmptyTiles : function () {
      
      var $thumbPage, emptySpots, tile, slider, lastSliderSize, i;
      $thumbPage = null;
      emptySpots = 0;
      tile = "<div class='mp-gallery-tile mp-empty-tile mp-control'></div>";
      slider = "<div class='mp-thumb-page'></div>";
      
      if (this.$gallery.children().length === 0) {
         
         this.$gallery.append(slider);
         $thumbPage = $(".mp-thumb-page");
         emptySpots = 5;
      } else {
         
         lastSliderSize = $(".mp-thumb-page").last().children().size();
         if (lastSliderSize < 5) {
            
            emptySpots = 5 - lastSliderSize;
            $thumbPage = $(".mp-thumb-page").last();
         }
      }
         
      for (i = 0; i < emptySpots; i++) {
         
         $thumbPage.append(tile);
      }
   },
   /**
    * @private
    */
   _appendImages : function (imageMatrix, imageSources) {
      
      var tmplData, i, getNextFive;
      i = 0;
      
      getNextFive = function (element, index) {
         return index >= i * 5 && index < i * 5 + 5;
      };
      while (i < imageMatrix.length) {
         tmplData = $.grep(imageSources, getNextFive);
         this.$gallery.append(
            $.jqote('#galleryTmpl', {
               thumbAddress: tmplData
            })
         );
         i++;
      }
 
   },
   /**
    * @private
    */
   _centerImages : function () {
      
      var $tile, $thumb, photos;
      $tile = $(".mp-gallery-tile, .mp-sortable-tile");
      photos = main.getUIState().getPhotos();
      
      photos.forEach(function (photo) {
         
         $thumb = $tile.find("img[src='" + photo.thumb + "']");
         main.getUI().getTools().centerElement($tile, $thumb);
      });
   },
   /**
    * @private
    */
   _initializeScrollable : function () {
      this.$container.scrollable({
         items: ".mp-gallery-inner",
         prev: ".mp-gallery-nav-prev",
         next: ".mp-gallery-nav-next",
         circular: true,
         mousewheel: true,
         speed: 500,
         vertical: false,
         easing: "swing"
      });
   },
   /**
    * @private
    */
   _initializeSortable : function () {
      
      var $fullGallery, $currentTile, jsonPhotos, jsonPhoto, state, instance = this;
      state = main.getUIState();
      $fullGallery = $(".mp-full-gallery");
      
      $fullGallery
         .sortable({
            items : ".mp-sortable-tile",
            update : function (event, ui) {
               instance._searchImages();
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
            $el
               .addClass('current')
               .removeClass("visited")
               .siblings('img').removeClass('current');
            photo = $.grep(state.getPhotos(), function (e, i) {
               return e.thumb === $el.attr("src");
            })[0];
            state.setCurrentPhotoIndex(instance.getImageIndex($el));
            state.setCurrentPhoto(photo);

            if (authorized) {
               controls.setModifyPhoto(true);
               controls.showPhotoControls($el);
            }
            tools.setCursor($el, "pointer");
         })
         .on('mouseleave.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            //add visited border if necessary
            (state.getPhotos())[$el.index()].checkBorder();
            $el.removeClass('current');

            if (authorized) {
               controls.hideEditControls(true);
            }
         })
         .on('mousedown.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            // set Cursor for DragnDrop on images (grabber)
            tools.setCursor($el, "move");
         });
      
      $(".mp-open-full-gallery").on("click", function (event) {
      
         instance.showFullGallery();
      });
      $(".mp-close-full-left-column").on("click", function (event) {
         instance.hideFullGallery();
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
         .on('click.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            
            $el.removeClass('current');
            state.setCurrentLoadedPhotoIndex(instance.getImageIndex($el));
            state.setCurrentLoadedPhoto(state.getPhotos()[instance.getImageIndex($el)]);
            
            main.getUI().getControls().hideEditControls(false);
            
            // starts little slideshow in gallery div
            main.getUI().getSlideshow().startSlider();
         });
   }

};
