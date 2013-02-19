/*jslint */
/*global $, main, CarouselPage */

"use strict";

/**
 * @author Frederik Claus
 * @class creates an infinite carousel (for images) with given data using DataPage.
 * @requires DataPage
 */

   
var UIPhotoCarousel = function ($photos, imageSources, options) {
   
   // make a deep copy of the imageSources so that the original aray won't get modified
   
   this.defaults = {
      lazy : false,
      effect : "fade",
      context : this,
   };
   this.options = $.extend({}, this.defaults, options);
   
   this.$items = $photos;
   this.size = this.$items.length;

   this.dataPage = new CarouselPage(imageSources, this.size);
   
   this.currentPage = null;
   this.isStarted = false;
};

/**
 * @author Marc-Leon Roemer
 * @description defines handler to initialize and navigate through the carousel and to load images (supports lazy-loading)
 */
UIPhotoCarousel.prototype = {
   
   /**
    * @description Loads all photos, or just current page depending on this.options.lazy (=true/false). 
    * When everything is loaded this.options.onLoad (optional)  is executed and the carousel is updated to show the current page.
    * @param {int} from: Index of the first photo to update. Default is 0. 
    */
   _load : function (from) {
      var i, j, loadHandler, loaded, maxLoad, currentPage, source, instance = this, imageSources, nSources;
      loaded = 0;

      if (from === undefined || from === null) {
         from = 0;
      }

      // only load current page
      //TODO this should only load pictures from index 'from' , if specified
      if (this.options.lazy) {
         // filter current page to get the actual amount of images
         imageSources = this.currentPage.filter(function (e, i) {
            return e !== null;
         });
      }
      // load everything
      else {
         imageSources = this.dataPage.getAllEntries();
      }
      // handler is called after all images are loaded
      loadHandler = function () {
         ++loaded;

         if (loaded === nSources) {
            // if there is a load-handler specified in the options, execute it first
            if (typeof instance.options.afterLoad === "function") {
               //TODO call with elements loaded
               instance.options.afterLoad.call(instance.options.context, instance.$items.slice(from, nSources));
            }
            instance._update(from, nSources);
         }
      };
      nSources = imageSources.length;

      if (typeof this.options.beforeLoad === "function") {
         //TODO nSources is not the last index but the length
         this.options.beforeLoad.call(this.options.context, this.$items.slice(from, nSources));
      }
      
      if (nSources === 0){
         if (typeof this.options.afterLoad === "function") {
            instance.options.afterLoad.call(instance.options.context, $());
         }
      }

      for (i = 0; i < nSources; i++) {
         source = imageSources[i];

         $('<img/>')
            .load(loadHandler)
            .attr('src', source);
      }

   },
   /**
    * @description Updates carousel to show current page.
    * @param {int} from: The index of the first photo that gets updated. Default is 0
    */
   _update : function (from, to) {
      
      var showNew, 
          instance = this, 
          duration, 
          imageSource,
          $items = this.$items.slice(from, to),
          nItems = $items.length,
          nUpdated = 0,
          // we need to make sure we call update after all(!) photos are completely faded in/out
          updated = function () {
             nUpdated += 1;
             if (nUpdated === nItems){
                // execute onUpdate handler if defined in options
                if (instance.options.onUpdate) {
                   instance.options.onUpdate.call(instance.options.context, $items);
                }
             }
          };
      
      // remove mp-animate classes
      $items.removeClass("mp-animate-02s mp-animate-08s");
      
      
      if (this.options.effect === "foldIn") {
         $items.addClass("mp-animate-02s mp-scale-X-0");
         duration = 200;
      } else {
         $items.fadeTo(500, 0);
         duration = 500;
      }

      

      window.setTimeout(function () {
         $items.each(function (index) {
            imageSource = instance.currentPage[from + index];
            if ( imageSource !== null) {
               $(this).fadeTo(duration, 1, updated)
                  .attr("src", imageSource)
               // needed for frontend testing to select 'active' photos
                  .addClass("mp-test-photo-used");
            } else {
               $(this).fadeOut(0, updated)
                  .removeAttr("src")
               // needed for frontend testing to select 'active' photos
                  .removeClass("mp-test-photo-used");
            }

         });
         if (instance.options.effect === "foldIn") {
            $items.removeClass("mp-scale-X-0");
         }

      }, duration);
   },
   
   /**
    * @description Starts the carousel by loading the first or the requested page
    */
   start : function (index) {
      
      this.isStarted = true;
      if (index) {
         this.navigateTo(index);
         this.currentPageIndex = index;
      } else {
         this.currentPage = this.dataPage.getFirstPage();
         this.currentPageIndex = 0;
         this._load();
      }
   },
   insertPhoto : function (imageSource) {
      console.log("Adding new photo "+imageSource+" to Carousel");
      // update page
      this.dataPage.insertEntry(imageSource);
      var from = this.dataPage.getIndexOfEntry(imageSource);
     
      // Did we insert on the current page? Then we need to update it
      if (this.isLastPage()){
         console.log("New photo is inserted on current page. Reload current page from index %d.", from);
         this.currentPage = this.dataPage.getCurrentPage();
         this._load(from);
      }
   },
   deletePhoto : function (imageSource) {

      var instance = this, 
          from = this.dataPage.getCurrentPage().indexOf(imageSource),
          oldPage = this.dataPage.getCurrentPage();

      this.dataPage.deleteEntry(imageSource);

      // Did we delete on the current page?
      if ($.inArray(imageSource, oldPage) !== -1) {
         this.$items
            .filter("img[src='" + imageSource + "']")
            .fadeOut(500, function () {
               $(this).attr("src", null);
               instance.currentPage = instance.dataPage.getCurrentPage();
               instance._load(from);
            });
      }
   },
   /**
    * @description resets carousel, so that no images are shown
    */
   reset : function () {
      
      this.dataPage = null;
      this.options = null;
      this.currentPage = null;
      this.$items.each(function (index) {
         
         $(this).hide().attr("src", "");
      });
   },
   navigateTo : function (to) {
      switch (to) {
      case "start":
         this.currentPage = this.dataPage.getFirstPage();
         break;
      case "end":
         this.currentPage = this.dataPage.getLastPage();
         break;
      default:
         this.currentPage = this.dataPage.getPage(to);
         break;
      }
      this._load();
   },
   navigateLeft : function () {
      this.currentPage = this.dataPage.getPreviousPage();
      this._load();
   },
   navigateRight : function () {
      this.currentPage = this.dataPage.getNextPage();
      this._load();
   },
   isLastPage : function () {
      return this.dataPage.isLastPage();
   },
   getAllImageSources : function () {
      return this.dataPage.getAllEntries();
   }
};
   