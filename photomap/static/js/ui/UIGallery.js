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
   this.mainWrapperWidth = this.$mainWrapper.width();
   this.$galleryWrapper = $('#mp-gallery-thumbs');
   this.$gallery = $('#mp-gallery-inner');
   this.$galleryPages = null;
   this.visible = false;
   this.$elements = null;

};

UIGallery.prototype =  {

   initAfterAjax : function () {
      if (main.getClientState().isAdmin()) {
         this.$container.bind('dragover', fileUpload.handleGalleryDragover);
         this.$container.bind('drop', fileUpload.handleGalleryDrop);
         this.bindListener();
      }
      this.bindStartSlideshowListener();
      // align gallery with map
      this.$container.css("width", this.$container.width() + 10 + "px");
   },
   /**
    * @author Frederik Claus
    * @description Reselect all images in the gallery. This is necessary when the gallery gets updated
    * @private
    */
   searchImages : function () {
      this.$elements = this.$gallery.find('div.mp-gallery > img').not(".mp-controls-options");
      this.$galleryPages =  this.$gallery.find('.mp-thumb-page');
   },
   getImageBySource : function (source) {
      
      // due to the way .scrollable() works each img is 3 times in Gallery -> you need to pic the second, which is the currently visible 
      return this.$gallery.find("img[src='" + source + "']").eq(1);
   },
   _resizeThumbs : function () {
      
      var $thumbs, padding, increasedPadding, length, totalLength, border;
      
      $thumbs = $(".mp-gallery-tile");
      padding = 5;
      border = 8;
/*      this.$mainWrapper.css({
         width: this.mainWrapperWidth - border + "px",
         paddingLeft: border + "px"
      });
   */   
      length = this.$mainWrapper.height() - (padding * 2);
      totalLength = (length + padding * 2) * 5 + border * 5;
      if (totalLength > this.$mainWrapper.width()) {
         length = (this.$mainWrapper.width() - border * 5) / 5 - 2 * padding;
         increasedPadding = (this.$mainWrapper.height() - length) / 2;
      } else {
         increasedPadding = padding;
      }
      
      $thumbs.css({
         "width": length,
         "height": length,
         padding: increasedPadding + "px " + padding + "px"
      });
   },
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
    * @returns {jQElement} Gallery element
    */
   getEl : function () {
      return this.$gallery;
   },
   getScrollable : function () {
      return this.$container.data('scrollable');
   },
   getImageIndex : function ($image) {
      
      var sliderIndex, imageIndex;
      
      sliderIndex = this.getScrollable().getIndex();
      imageIndex = $image.parent().index();
      
      return sliderIndex * 5 + imageIndex;
   },
  /**
   * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
   */
   show : function (photos) {
      
      var state, controls, authorized, tmplPhotosData, tmplData, photoMatrix, loaded, i, j, k, l, m, n, instance = this;
      state = main.getUIState();
      controls = main.getUI().getControls();
      authorized = main.getClientState().isAdmin();
      
      if (photos && photos.length !== 0) {
         
         state.setPhotos(photos);
         
         state.setAlbumLoading(true);
         tmplPhotosData = [];
         loaded = 0;
         i = 0;
         main.getUI().disable();
         this.$gallery.empty().css("left", 0);
         
         while (i < photos.length) {
            
            if (photos[i] === undefined) {
               console.log(photos[i]);
            } else {
               tmplPhotosData.push(photos[i].thumb);
               $('<img/>').load(function () {
                  ++loaded;
                  if (loaded === photos.length) {
                     main.getUIState().setAlbumLoading(false);
                     main.getUI().enable();
                     // create a matrix with 6 columns out of the photos-Array and display each row in a separate div
                     photoMatrix = main.getUI().getTools().createMatrix(photos, 5);
                     instance._appendImages(photoMatrix, tmplPhotosData);
                     // fill last slider up with empty tiles (unless it is already filled with pics
                     instance._createEmptyTiles();
                     //search all anchors
                     instance.searchImages();
                     // adjust height to make the thumbs square
                     instance._resizeThumbs();
                     // admin listeners
                     if (authorized) {
                        instance._bindSortableListener();
                     }
                     // center the images and put 3 in a row
                     instance._createFilmRollEffect();
                     // initialize scrollable
                     instance._initializeScrollable();
                     
                     instance._centerImages();
                     instance.showBorder();
                  }
               }).attr('src', photos[i].thumb);
            }
            i++;
         }
      } else {
         this.$gallery.empty().css("left", 0);
         this._createEmptyTiles();
         this._resizeThumbs();
         this._createFilmRollEffect();
      }
   },
   showBorder: function () {
      //draw border on visited elements
      main.getUIState().getPhotos().forEach(function (photo) {
         photo.checkBorder();
      });
   },
   _initializeScrollable : function () {
      this.$container.scrollable({
         items: ".mp-gallery-inner",
         prev: ".mp-gallery-nav-prev",
         next: ".mp-gallery-nav-next",
         circular: true,
         mousewheel: true,
         speed: 500,
         vertical: false
      });
   },
   /**
    * @private
    * Nur vorläufige Variante - später über css (wenn möglich)
    */
   _createFilmRollEffect : function () {
      
      var $thumbpage, $thumbs, $nav, $leftNav, $rightNav, borderSize, border, thumbWidth, galleryWidth, thumbPadding, leftNavMargin, rightNavMargin, rightNavWidth;
      
      $thumbs = $(".mp-gallery-tile");
      $nav = $(".mp-gallery-nav");
      $leftNav = $("#mp-gallery-left-nav");
      $rightNav = $("#mp-gallery-right-nav");
      
      thumbWidth = $thumbs.innerWidth() * 5;
      galleryWidth = this.$mainWrapper.width();
      borderSize = (galleryWidth - thumbWidth) / 5;
      border = "px solid #dadada";
      
      $nav.css({
         height: $thumbs.innerHeight() - 10 + "px",
         padding: "5px 0"
      });
      $thumbs.css({
         borderRight: borderSize / 2 + border,
         borderLeft: borderSize / 2 + border
      });
      $thumbpage = $(".mp-thumb-page").not("cloned").first();
      if (this.mainWrapperWidth > $thumbpage.width()) {
         borderSize += (this.$mainWrapper.width() - $thumbpage.width()) / 5;
      }
      // adjust border again so that the thumbpage certainly fits exactely into the gallery
      $thumbs.css({
         borderRight: borderSize / 2 + border,
         borderLeft: borderSize / 2 + border
      });

      // adjust right nav-div
      rightNavWidth = this.$container.width() - (this.$mainWrapper.innerWidth() + $leftNav.width());
      //$("#mp-gallery-right-nav").css("width", rightNavWidth + "px");
   },
   /**
    * @private
    */
   _appendImages : function (imageMatrix, imageSources) {
      
      var tmplData, i;
      i = 0;
      
      while (i < imageMatrix.length) {
         tmplData = $.grep(imageSources, function (element, index) {
            return index >= i * 5 && index < i * 5 + 5;
         });
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
      $tile = $(".mp-gallery-tile");
      photos = main.getUIState().getPhotos();
      
      photos.forEach(function (photo) {
         
         $thumb = $("img[src='" + photo.thumb + "']");
         main.getUI().getTools().centerElement($tile, $thumb);
      });
   },
   checkSlider : function () {
      
      var state, photo, currentIndex, sliderIndex, newSliderIndex, indexInSlider;
      
      state = main.getUIState();
      photo = state.getCurrentLoadedPhoto();
      currentIndex = state.getCurrentLoadedPhotoIndex();
      sliderIndex = this.getScrollable().getIndex();
      
      indexInSlider = currentIndex > sliderIndex * 6 && currentIndex < sliderIndex * 6 + 6;
      if (!indexInSlider) {
         newSliderIndex = Math.floor(currentIndex / 6);
         this.getScrollable().seekTo(newSliderIndex);
      }
   },
   /* ---- Listeners ---- */
   /**
    * @private
    */
   _bindSortableListener : function () {
      
      var jsonPhotos, jsonPhoto, currentPhoto, state, instance = this;
      state = main.getUIState();
      
      this.$gallery
         .find("div.mp-gallery")
         .sortable({
            items : "img.sortable",
            start : function (event, ui) {
               ui.item.addClass("noClick");
            },
            update : function (event, ui) {
               instance.searchImages();
               jsonPhotos = [];

               state.getPhotos().forEach(function (photo, index, photos) {
                  // get html tag for current photo
                  currentPhoto = $('img[src="' + photo.thumb + '"]');
                  // find index of current photo in mp-gallery
                  photo.order = instance.$elements.index(currentPhoto);
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
   bindListener : function () {

      var state, cursor, controls, authorized, photo, instance = this;
      state = main.getUIState();
      cursor = main.getUI().getCursor();
      controls = main.getUI().getControls();
      authorized = main.getClientState().isAdmin();

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
            cursor.setCursor($el, cursor.styles.pointer);
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
            cursor.setCursor($el, cursor.styles.grab);
         });
   },
   bindStartSlideshowListener : function () {
      var state, cursor, controls, authorized, photo, instance = this;
      state = main.getUIState();
      cursor = main.getUI().getCursor();
      controls = main.getUI().getControls();
      authorized = main.getClientState().isAdmin();

      this.$gallery
         .on('click.Gallery', "img.mp-thumb", function (event) {
            var $el = $(this);
            // workaround for DnD click event:
            // when element gets dragged class "noClick" is added, when it's dropped and the click event
            // is triggered, instead of starting the slideshow, the class "noClick" is getting removed
            if ($el.hasClass("noClick")) {
               $el.removeClass("noClick");
            } else {
               
               $el.removeClass('current');
               state.setCurrentLoadedPhotoIndex(instance.getImageIndex($el));
               state.setCurrentLoadedPhoto(state.getPhotos()[instance.getImageIndex($el)]);

               main.getUI().getControls().hideEditControls(false);
               
               // starts little slideshow in gallery div
               main.getUI().getSlideshow().startSlider();

               //return false;
            }
         });
   }

};
