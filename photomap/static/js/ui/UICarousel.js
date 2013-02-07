/*jslint */
/*global $, main, DataPage */

"use strict";

/**
 * @author Frederik Claus
 * @class creates an infinite carousel (for images) with given data using DataPage.
 * @requires DataPage
 */

var UICarousel;
   
UICarousel = function ($el, imageSources, options) {
   
   // make a deep copy of the imageSources so that the original aray won't get modified
   this.data = $.extend(true, [], imageSources);
   this.dataPage = new DataPage(imageSources, $el.find("img").length);
   
   this.defaults = {
      lazy : false,
      effect: "fade",
      onLoad : null
   };
   this.options = $.extend({}, this.defaults, options);
   
   this.$root = $el;
   this.$items = $el.find("img");
   this.size = this.$items.length;
   
   this.currentPage = null;
   this.loadedData = [];
};

/**
 * @author Marc-Leon Roemer
 * @description defines handler to initialize and navigate through the carousel and to load images (supports lazy-loading)
 */
UICarousel.prototype = {
   
   /**
    * @description Loads all photos, or just current page depending on this.options.lazy (=true/false). When everything is loaded this.options.onLoad (optional) 
    * is executed and the carousel is updated to show the current page.
    */
   _load : function () {
      
      var i, j, loadHandler, loaded, maxLoad, currentPage, source, instance = this;
      loaded = 0;
      
      // handler is called after all images are loaded
      loadHandler = function () {
         
         ++loaded;
         if (loaded === maxLoad) {
            
            // if there is a load-handler specified in the options, execute it first
            if (instance.options.onLoad !== null) {
               instance.options.onLoad();
            }
            instance._update();
         }
      };
      
      // check whether lazy loading is enabled or not
      if (this.options.lazy) {
         
         // filter current page to get the actual amount of images
         currentPage = this.currentPage.page.filter(function (e, i) {
            return e !== null;
         });
         // set maxLoad to the amount of images on the current page
         maxLoad = currentPage.length;
         
         for (i = 0; i < maxLoad; i++) {
            
            source = this.currentPage.page[i];
            
            if (source !== null) {
               // add sources to loadedData
               if ($.inArray(source, this.loadedData) === -1) {
                  this.loadedData.push(source);
               }
               // load images
               $('<img/>')
                  .load(loadHandler)
                  .attr('src', source);
            }
         }
      } else {
         
         // set maxLoad to the full data-length
         maxLoad = this.data.length;
         
         for (i = 0; i < maxLoad; i++) {
            
            source = this.data[i];
            
            if (source !== null) {
               // add sources to loadedData
               if ($.inArray(source, this.loadedData) === -1) {
                  this.loadedData.push(source);
               }
               // load images
               $('<img/>')
                  .load(loadHandler)
                  .attr('src', this.data[i]);
            }
         }
      }
   },
   
   /**
    * @description Updates carousel to show current page.
    */
   _update : function () {
      
      var showNew, instance = this;
      
      // remove mp-animate classes
      this.$items.removeClass("mp-animate-02s mp-animate-08s");
      
      if (this.currentPage !== null) {
         
         if (this.options.effect === "foldIn") {
            
            showNew = function () {
            
               instance.$items.each(function (index) {
                  if (instance.currentPage.page[index] !== null) {
                     $(this).fadeTo(200, 1).attr("src", instance.currentPage.page[index]);
                  } else {
                     $(this).fadeOut(0);
                  }
               });
               instance.$items.removeClass("mp-scale-X-0");
            };
            
            instance.$items.addClass("mp-animate-02s mp-scale-X-0");
            // transition time is .2s
            window.setTimeout(showNew, 200);
         
         } else if (this.options.effect === "fade") {
            
            showNew = function () {
            
               instance.$items.each(function (index) {
                  if (instance.currentPage.page[index] !== null) {
                     $(this).fadeTo(500, 1).attr("src", instance.currentPage.page[index]);
                  } else {
                     $(this).fadeOut(0);
                  }
               });
            };

            instance.$items.fadeTo(500, 0);
            window.setTimeout(showNew, 500);
         }
      }
   },
   
   /**
    * @description Starts the carousel by loading the first or the requested page
    */
   start : function (index) {
      
      if (index) {
         this.navigateTo(index);
      } else {
         this.currentPage = this.dataPage.getFirstPage();
         this._load();
      }
   },
   
   /**
    * @description reinitialises the DataPage-Instance once the sources have been updated (element removed or added)
    */
   reinitialise : function (newImageSources) {
      
      // reinit DataPage
      this.dataPage = new DataPage(newImageSources, this.$items.length);
   },
   /**
    * @description resets carousel, so that no images are shown
    */
   reset : function () {
      
      this.data = null;
      this.dataPage = null;
      this.options = null;
      this.currentPage = null;
      this.loadedData = [];
      this.$items.each(function (index) {
         
         $(this).hide().attr("src", "");
      });
   },
   /**
    * @description returns array with sources of already loaded images
    */
   getLoadedData : function () {
      return this.loadedData;
   },
   // reloads the current page (-> can be called after photo was deleted)
   reloadCurrentPage : function () {
      
      // get currentPage (if page is empty, cause all images were deleted -> get previous page)
      try {
         this.currentPage = this.dataPage.getPage(this.currentPageIndex);
      } catch (e) {
         if (e.message === "IndexOutOfBounds") {
            this.currentPage = this.dataPage.getPage(this.currentPageIndex - 1);
         }
      }
      
      this._load();
   },
   navigateTo : function (index) {
      
      switch (index) {
      case "start":
         this.currentPage = this.dataPage.getFirstPage();
         break;
      case "end":
         this.currentPage = this.dataPage.getLastPage();
         break;
      default:
         try {
            this.currentPage = this.dataPage.getPage(index);
         } catch (e) {
            this.currentPage = null;
            alert(e.message);
         }
         break;
      }
      
      this._load();
   },
   navigateLeft : function () {
      
      try {
         
         this.currentPage = this.dataPage.getPreviousPage();
         
      } catch (e) {
         
         if (e.message === "IndexOutOfBounds") {
            
            this.currentPage = this.dataPage.getLastPage();
         
         } else {
            
            this.currentPage = null;
            alert(e.message);
         }
      }
      
      this._load();
   },
   
   navigateRight : function () {
      
      try {
         
         this.currentPage = this.dataPage.getNextPage();
         
      } catch (e) {
         
         if (e.message === "IndexOutOfBounds") {
            
            this.currentPage = this.dataPage.getFirstPage();
         
         } else {
            
            this.currentPage = null;
            alert(e.message);
         }
      }
      this._load();
   }
};
   