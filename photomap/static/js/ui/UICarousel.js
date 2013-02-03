/*jslint */
/*global $, main, DataPage */

"use strict";

/**
 * @author Frederik Claus
 * @class creates an infinite carousel (for images) with given data using DataPage.
 * @requires DataPage
 */

var UICarousel;
   
UICarousel = function ($el, imageSources) {
   
   this.dataPage = new DataPage(imageSources, $el.find("img").length);
   
   this.$root = $el;
   this.$items = $el.find("img");
   
   this.currentPageIndex = null;
};

/**
 * @author Marc-Leon Roemer
 * @description defines handler to initialize and navigate through the carousel
 */
UICarousel.prototype = {
   
   _updateCarousel : function (newPage) {
      
      var showNew, instance = this;
      
      showNew = function () {
         
         instance.$items.each(function (index) {
            
            if (newPage.page[index] !== null) {
               $(this).fadeIn(200).attr("src", newPage.page[index]);
            } else {
               $(this).hide();
            }
         });
         instance.$items.removeClass("mp-scale-X-0");
      };
      
      if (newPage !== null) {
         this.currentPageIndex = newPage.index;
         this.$items.addClass("mp-scale-X-0");
         // transition time is .2s
         window.setTimeout(showNew, 200);
      }
   },
   
   /**
    * @description Starts the carousel by adding the mp-animate class to the items and loading the first page
    */
   start : function () {
      
      var i, startPage = this.dataPage.getFirstPage();
      
      for (i = 0; i < this.$items.length; i++) {
         $(this.$items[i]).addClass("mp-animate");
      }
      
      this._updateCarousel(startPage);
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
      
      this.dataPage = null;
      this.currentPageIndex = null;
      this.$items.each(function (index) {
         
         $(this).hide().attr("src", null);
      });
   },
   // reloads the current page (-> can be called after photo was deleted)
   reloadCurrentPage : function () {
      
      var page;
      
      // get currentPage (if page is empty, cause all images were deleted -> get previous page)
      try {
         page = this.dataPage.getPage(this.currentPageIndex);
      } catch (e) {
         if (e.message === "IndexOutOfBounds") {
            page = this.dataPage.getPage(this.currentPageIndex - 1);
         }
      }
      
      this._updateCarousel(page);
   },      
   navigateTo : function (index) {
      
      var page;
      
      switch (index) {
      case "start":
         page = this.dataPage.getFirstPage();
         break;
      case "end":
         page = this.dataPage.getLastPage();
         break;
      default:
         try {
            page = this.dataPage.getPage(index);
         } catch (e) {
            page = null;
            alert(e.message);
         }
         break;
      }
      
      this._updateCarousel(page);
   },
   navigateLeft : function () {
      
      var page;
      
      try {
         
         page = this.dataPage.getPreviousPage();
         
      } catch (e) {
         
         if (e.message === "IndexOutOfBounds") {
            
            page = this.dataPage.getLastPage();
         
         } else {
            
            page = null;
            alert(e.message);
         }
      }
      if (page !== null) {
         this._updateCarousel(page);
      }
   },
   
   navigateRight : function () {
      
      var page;
      
      try {
         
         page = this.dataPage.getNextPage();
         
      } catch (e) {
         
         if (e.message === "IndexOutOfBounds") {
            
            page = this.dataPage.getFirstPage();
         
         } else {
            
            page = null;
            alert(e.message);
         }
      }
      if (page !== null) {
         this._updateCarousel(page);
      }
   }
};
   