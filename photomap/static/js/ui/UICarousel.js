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
};

/**
 * @author Marc-Leon Roemer
 * @description defines handler to initialize and navigate through the carousel
 */
UICarousel.prototype = {
   
   _updateCarousel : function (sources, dir) {
      
      var showNew, instance = this;
      
      showNew = function () {
         
         instance.$items.each(function (index) {
            $(this).attr("src", sources[index]);
         });
         instance.$items.removeClass("mp-scale-X-0");
      };
      
      if (sources !== null) {
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
      
      this.dataPage = new DataPage(newImageSources, this.$root.find("img").length);
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
         page = this.dataPage.getPage(index);
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
   