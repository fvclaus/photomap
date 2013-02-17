/*jslint */
/*global $, main, fileUpload, UIPhotoCarousel */

"use strict";

/**
 * @author Frederik Claus
 * @class UIFullGallery displays all Photos of the current Place as thumbnails to allow easy editing and D'n'D.
 * @requires ClientServer
 */
var UIFullGallery = function () {
   this.loaded = false;
   this.carousel = null;
   this.$container = $("#mp-full-left-column").find(".mp-data");
   this.$column = $("#mp-full-left-column");
},
/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 * @requires UICarousel
 */
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
  
   this.fullGallery = new UIFullGallery();
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
   triggerClickOnPhoto : function (photo) {
      this.$photo.find("[src='" + photo.thumb + "']").trigger("click");
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
      this.fullGallery.destroy();

      // initialize and start carousel
      options = {
         lazy : !main.getClientState().isAdmin(),
         effect : "foldIn",
         beforeLoad : this._beforeLoad,
         afterLoad : this._afterLoad,
         context : this
      };
      photos.forEach(function (photo, index) {
         imageSources.push(photo.thumb);
      });
      this.carousel = new UIPhotoCarousel(this.$inner.find("img.mp-thumb"), imageSources, options);
      this.fullGallery.setCarousel(this.carousel);

      // disable ui while loading & show loader
      state.setAlbumLoading(true);
      ui.disable();
      // ui.showLoading();
      this.carousel.start();
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
      } else if (!this.isStarted) {
         // show the new photo
         //TODO this does now show the new photo yet
         this.start();
      }
         
   },
   /**
    * @description Deletes an existing Photo. If the Photo was on the current page, fade it out and move all
    * remaining Photos to the left. If Photo was the last Photo, show an empty page.
    */
   deletePhoto : function (photo) {
      // automatically delete if photo is on current page
      // otherwise we dont care
      this.carousel.deletePhoto(photo.thumb);
   },
   /**
    * @description Resets the Gallery to the state before start() was called. This will delete exisiting Photos.
    */
   reset : function () {
      
      this.isStarted = false;
      $(".mp-gallery-loader").hide();
      if (this.carousel !== null) {
         this.carousel.reset();
         this.carousel = null;
      }
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
    * @private
    * @description handler is called after gallery-thumbs are loaded
    */
   _beforeLoad : function ($photos) {
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
      var ui = main.getUI();
      //enable ui
      ui.enable();
   },
   /**
    * @private
    * @returns {int} Index of the $image element in all Photos of that Place, -1 if Photo does not belong to this place
    */
   _getIndexOfImage : function ($image) {
      return this.carousel.getAllImageSources().indexOf($image.attr("src"));
   },
   /**
    * @private
    * @returns {int} Index of the first photo currently visible
    */
   _getIndexOfFirstThumbnail : function () {
      return this._getIndexOfImage(this.$photos.first());
   },
   /**
    * @private
    * @return {int} Index of the last photo currently visible
    */
   _getIndexOfLastThumbnail : function () {
      //this does not work with a simple selector
      var $photo = this.$photos.first();
      this.$photos.each(function (photoIndex) {
         if ($(this).attr("src")){
            $photo = $(this);
         }
      });
      return this._getIndexOfImage($photo);
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
         photo = null,
         instance = this;
      
      //bind events on anchors
      // bind them to thumbs in the Gallery & FullGallery
      $(".mp-left-column")
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

      $(".mp-open-full-gallery").on("click", function (event) {
         
         if (!main.getUI().isDisabled()) {
            instance.fullGallery.start();
         }
      });
      $(".mp-close-full-left-column").on("click", function (event) {
         
         if (!main.getUI().isDisabled()) {
            instance.fullGallery.destroy();
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
};


UIFullGallery.prototype = {
   /**
    * @description UIFullGallery can be instantiated without a UIPhotoCarousel. It needs to be set before calling start()
    */
   setCarousel : function (carousel) {
      this.carousel = carousel;
   },
   /**
    * @description Starts the Gallery. Generates new Html every time start is called.
    * Therefore there is no need for messy array synchronisation or the like.
    */
   start : function () {
      if (this.carousel === null) {
         throw new Error("UIFullGallery needs a reference to a UIPhotoCarousel before starting");
      }
      this.$container
         .addClass("mp-full-gallery")
         .append(
            $.jqote('#fullGalleryTmpl', {
               thumbSources: this.carousel.getAllImageSources()
            }))
         .removeClass("mp-nodisplay");
      this._initializeSortable();
      this.$column.removeClass("mp-nodisplay");
      this.loaded = true;
   },
   /**
    * @description Closes the Gallery. This will remove any Html previously created.
    */
   destroy : function () {

      if (this.$container.hasClass("ui-sortable")){
         this.$container.sortable("destroy");
      }
      this.$container
         .empty()
         .removeClass("mp-full-gallery")
         .addClass("mp-nodisplay");

      this.$column.addClass("mp-nodisplay");
      this.loaded = false;
   },
   //TODO start & show currently not in use
//    show : function () {
      
//       if (!this.loaded) {
//          this.start();
//          //TODO Das geht noch nicht.
// //         $(".mp-full-gallery").jScrollPane();
//       }
//       this.$column.removeClass("mp-nodisplay");
//    },
//    hide : function () {
//       this.$column.addClass("mp-nodisplay");

//       if (this.changed) {
//          main.getUIState().getCurrentPlace().triggerDoubleClick();
//          this.changed = false;
//       }
//    },
   /**
    * @private
    */
   _initializeSortable : function () {
      
      var $currentTile = null,
          jsonPhotos = [], 
          jsonPhoto = null, 
          state = main.getUIState(),
          instance = this;
      
      $(".mp-sortable-tile").on("click.UIDisabled", function () {
         if (main.getUI().isDisabled()) {
            return false;
         }
      });
      this.$container
         .sortable({
            items : ".mp-sortable-tile",
            update : function (event, ui) {
               jsonPhotos = [];

               state.getPhotos().forEach(function (photo, index, photos) {
                  // get html tag for tile containing current photo
                  $currentTile = instance.$container.find('img[src="' + photo.thumb + '"]').parent();
                  // make a deep copy
                  jsonPhoto = $.extend(true, {}, photo);
                  jsonPhoto.order = instance.$container.children().index($currentTile);
                  console.log("Changing order of Photo %s from %d to %d", photo.title, photo.order, jsonPhoto.order);
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