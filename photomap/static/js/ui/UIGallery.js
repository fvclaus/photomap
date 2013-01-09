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
   _resizeThumbs : function () {
      
      var $thumbs, padding, increasedPadding, length, totalLength, border;
      
      $thumbs = $(".mp-thumb");
      padding = 5;
      border = 2 * 5;
      length = this.$mainWrapper.height() - (padding * 2) - border;
      totalLength = (length + padding * 2 + border) * 5;
      if (totalLength > this.$mainWrapper.width()) {
         length = this.$mainWrapper.width() / 5 - 2 * padding - border;
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
      imageIndex = $image.index();
      
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
      
      if (photos.length !== 0) {
         
         state.setPhotos(photos);
         
         state.setAlbumLoading(true);
         tmplPhotosData = [];
         loaded = 0;
         i = 0;
         main.getUI().disable();
         this.$gallery.empty();
         
         while (i < photos.length) {
            
            if (photos[i] === undefined) {
               console.log(photos[i]);
            } else {
               tmplPhotosData.push(photos[i].source);
               $('<img/>').load(function () {
                  
                  ++loaded;
                  
                  if (loaded === photos.length) {
                     main.getUIState().setAlbumLoading(false);
                     main.getUI().enable();
                     // create a matrix with 6 columns out of the photos-Array and display each row in a separate div
                     photoMatrix = main.getUI().getTools().createMatrix(photos, 5);
                     instance._appendImages(photoMatrix, tmplPhotosData);
                     //search all anchors
                     instance.searchImages();
                     // adjust height to make the thumbs square
                     instance._resizeThumbs();
                     // admin listeners
                     if (authorized) {
                        instance._bindSortableListener();
                     }
                     // center the images and put 3 in a row
                     //instance._centerImages();
                     instance._createFilmRollEffect();
                     // initialize scrollable
                     instance._initializeScrollable();
                     
                     // load the first Photo into the Slideshow
                     state.getPhotos()[0].triggerClick();
                     
                     instance.showBorder();
                  }
               }).attr('src', photos[i].source);
            }
            i++;
         }
      } else {
         this.$gallery.empty();
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
         vertical: false
      }).navigator();
   },
   /**
    * @private
    */
   _createFilmRollEffect : function () {
      
      var $thumbs, $nav, $leftNav, $rightNav, border, thumbWidth, galleryWidth, thumbPadding, leftNavMargin, rightNavMargin;
      
      $thumbs = $(".mp-thumb");
      $nav = $(".mp-gallery-nav");
      $leftNav = $("#mp-gallery-left-nav");
      $rightNav = $("#mp-gallery-right-nav");
      
      thumbWidth = $thumbs.innerWidth() * 5;
      galleryWidth = this.$mainWrapper.width();
      border = (galleryWidth - thumbWidth) / 10 + "px solid black";
      
      $nav.css({
         width: $nav.width() - 5 + "px",
         height: $nav.height() - 10 + "px",
         padding: "5px 0",
         backgroundColor: "#FAFAFA"
      });
      $rightNav.css("margin-left", "5px");
      $leftNav.css("margin-right", "5px");
      main.getUI().getTools().centerElement($nav, $(".mp-gallery-nav-prev"));
      main.getUI().getTools().centerElement($nav, $(".mp-gallery-nav-next"));
      
      $thumbs.css({
         borderRight: border,
         borderLeft: border
      });
      // adjust right nav-div
      $("#mp-gallery-right-nav").css("width", $("#mp-gallery-right-nav").width() + 1 + "px");
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
      
      var $thumbs, thumbWidth, galleryWidth, thumbPadding, marginEW;
      $thumbs = $(".mp-thumb");
      this.$galleryPages.width(this.$container.width() + "px");

      thumbWidth = $thumbs.width() * 5;
      galleryWidth = this.$container.width();
      thumbPadding = ($thumbs.innerWidth() - $thumbs.width()) * 5;
      marginEW = (galleryWidth - thumbWidth - thumbPadding - 5 * 10) / 10;
      
      $thumbs.css("margin", "0 " + marginEW + "px");
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
                  currentPhoto = $('img[src="' + photo.source + '"]');
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
         .on('mouseenter.Gallery', ".mp-thumb", function (event) {
            var $el = $(this);
            $el
               .addClass('current')
               .removeClass("visited")
               .siblings('img').removeClass('current');
            photo = $.grep(state.getPhotos(), function (e, i) {
               return e.source === $el.attr("src");
            });
            state.setCurrentPhotoIndex(instance.getImageIndex($el));
            state.setCurrentPhoto(photo);

            if (authorized) {
               controls.setModifyPhoto(true);
               controls.showPhotoControls($el);
            }
            cursor.setCursor($el, cursor.styles.pointer);
         })
         .on('mouseleave.Gallery', ".mp-thumb", function (event) {
            var $el = $(this);
            //add visited border if necessary
            (state.getPhotos())[$el.index()].checkBorder();
            $el.removeClass('current');

            if (authorized) {
               controls.hideEditControls(true);
            }
         })
         .on('mousedown.Gallery', ".mp-thumb", function (event) {
            var $el = $(this);
            // set Cursor for DragnDrop on images (grabber)
            cursor.setCursor($el, cursor.styles.grab);
         })
         .on('click.Gallery', ".mp-thumb", function (event) {
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
