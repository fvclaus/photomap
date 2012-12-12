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
   this.$galleryWrapper = $('#mp-gallery-thumbs');
   this.$gallery = $('#mp-gallery-inner');
   this.$galleryPage = $('.mp-thumb-page');
   this.visible = false;
   this.$elements = null;

};

UIGallery.prototype =  {

   initAfterAjax : function () {
      if (main.getClientState().isAdmin()) {
         this.$container.bind('dragover', fileUpload.handleGalleryDragover);
         this.$container.bind('drop', fileUpload.handleGalleryDrop);
      }
   },
   /**
    * @author Frederik Claus
    * @description Reselect all images in the gallery. This is necessary when the gallery gets updated
    * @private
    */
   searchImages : function () {
      this.$elements = this.$gallery.find('div.mp-gallery > img').not(".mp-option-add").not(".mp-controls-options");
   },
   _resizeThumbs : function () {
      
      var $thumbs, length;
      
      $thumbs = $(".mp-thumb");
      length = $thumbs.first().height();
      $thumbs.width(length);
   },
   /**
    * @returns {jQElement} Gallery element
    */
   getEl : function () {
      return this.$gallery;
   },
   getScrollPane : function () {
      return this.$gallery.data('jsp');
   },
   setScrollPane : function () {
      this.$gallery.jScrollPane({
         verticalDragMinHeight: 40,
         verticalDragMaxHeight: 40,
         animateScroll: true
      });
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
         photoMatrix = [];
         photoMatrix[0] = [];
         loaded = 0;
         i = 0;
         j = 0;
         k = 0;
         l = 0;
         m = 0;
         n = 0;
//         main.getUI().disable();
         this.$gallery.empty();
         
         while (i < photos.length) {
            
            if (photos[i] === undefined) {
               console.log(photos[i]);
               continue;
            } else {
               tmplPhotosData.push(photos[i].source);
               $('<img/>').load(function () {
                  
                  ++loaded;
                  
                  if (loaded === photos.length) {
                     main.getUIState().setAlbumLoading(false);
                     main.getUI().enable();
                     // create wrapping anchors for images
                     while (j <= 5) {
                        photoMatrix[l].push(photos[k]);
                        if (k === photos.length - 1) {
                           break;
                        }
                        if (j === 5) {
                           j = 0;
                           k++;
                           l++;
                           photoMatrix[l] = [];
                        } else {
                           j++;
                           k++;
                        }
                     }
                     console.log(photoMatrix);
                     console.log(photos);
                     console.log(loaded);
                     while (m < photoMatrix.length) {
                        console.log(photoMatrix[m].length);
                        tmplData = $.grep(tmplPhotosData, function (element, index) {
                           return index >= m * 6 && index < m * 6 + 6;
                        });
                        console.log(tmplPhotosData);
                        console.log(tmplData);
                        instance.$gallery.append(
                           $.jqote('#galleryTmpl', {
                              thumbAddress: tmplData
                           })
                        );
                        m++;
                     }
                     //search all anchors
                     instance.searchImages();
                     // adjust height to make the thumbs square
                     instance._resizeThumbs();
                     // admin listeners
                     if (authorized) {
                        instance._bindSortableListener();
                        controls.bindInsertPhotoListener();
                     }
                     // create scrollpane
                     //instance._bindScrollPaneListener();
                     instance.bindListener();
                     
                     instance.$galleryPage.width(instance.$container.width() + "px");
                     
                     var $thumbs = $(".mp-thumb");
                     var width = $thumbs.width() * 3;
                     var galleryWidth = instance.$container.width();
                     var padding = ($thumbs.innerWidth() - $thumbs.width()) * 3;
                     var margin = (galleryWidth - width - padding) / 6;
                     console.log("THIS IS THE MARGIN " + margin);
                     $thumbs.css("margin", "0 " + margin + "px");
                     
                     instance.$container.scrollable({
                        items: ".mp-gallery-inner",
                        prev: ".mp-gallery-nav-prev",
                        next: ".mp-gallery-nav-next",
                        circular: true,
                        vertical: false
                     }).navigator();
                     // load the first Photo into the Slideshow
                     state.getPhotos()[0].triggerClick();
                  }
               }).attr('src', photos[i].source);
            }
            i++;
         }
      } else {
         this.$gallery.empty();
      }
   },
   /* ---- Listeners ---- */
   /**
    * @private
    */
   _bindScrollPaneListener : function () {
      this.$gallery
         .css("padding-left", this.galleryPadding)
         .width(this.galleryWidth)
         .jScrollPane({
            verticalDragMinHeight	: 40,
            verticalDragMaxHeight	: 40,
            animateScroll		: true
         });
      //hack to remove horizontal scrollbars which always show up
      $(".jspHorizontalBar").remove();
   },
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
      instance.$elements
         .unbind('.Gallery')
         .bind('mouseenter.Gallery', function (event) {
            var $el = $(this);
            $el
               .addClass('current')
               .removeClass("visited")
               .siblings('img').removeClass('current');
            photo = (state.getPhotos())[$el.index()];
            state.setCurrentPhotoIndex($el.index());
            state.setCurrentPhoto(photo);

            if (authorized) {
               controls.setModifyPhoto(true);
               controls.showPhotoControls($el);
            }
            cursor.setCursor($el, cursor.styles.pointer);
         })
         .bind('mouseleave.Gallery', function (event) {
            var $el = $(this);
            //add visited border if necessary
            (state.getPhotos())[$el.index()].checkBorder();
            $el.removeClass('current');

            if (authorized) {
               controls.hideEditControls(true);
            }
         })
         .bind('mousedown.Gallery', function (event) {
            var $el = $(this);
            // set Cursor for DragnDrop on images (grabber)
            cursor.setCursor($el, cursor.styles.grab);
         })
         .bind('click.Gallery', function (event) {
            var $el = $(this);
            // workaround for DnD click event:
            // when element gets dragged class "noClick" is added, when it's dropped and the click event
            // is triggered, instead of starting the slideshow, the class "noClick" is getting removed
            if ($el.hasClass("noClick")) {
               $el.removeClass("noClick");
            } else {
               
               $el.removeClass('current');
               state.setCurrentLoadedPhotoIndex($el.index());
               state.setCurrentLoadedPhoto((state.getPhotos())[$el.index()]);

               main.getUI().getControls().hideEditControls(false);

               // starts little slideshow in gallery div
               main.getUI().getSlideshow().startSlider();

               //return false;
            }
         });

      //draw border on visited elements
      main.getUIState().getPhotos().forEach(function (photo) {
         photo.checkBorder();
      });
   }

};
