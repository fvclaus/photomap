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
      
      var showNew, i;
      
      showNew = function ($el, src) {
         
         $el
            .attr("src", src)
            .removeClass("mp-scale-X-0");
      };
      
      if (!dir || dir === "right") {
         for (i = 0; i < sources.length; i++) {
            
            this.$items[i].addClass("mp-scale-X-0");
            // transition time is .4s
            window.setTimeout(showNew(this.$items[i], sources[i]), 400);
         }
      } else if (dir === "left") {
         for (i = sources.length - 1; i >= 0; i--) {
            
            this.$items[i].addClass("mp-scale-X-0");
            // transition time is .4s
            window.setTimeout(showNew(this.$items[i], sources[i]), 400);
         }
      } else {
         alert("No direction specified");
      }
   },
   
   start : function () {
      
      var startPage = this.dataPage.getFirstPage();
      
      this.$items.forEach(function ($item) {
         $item.addClass("mp-animate");
      });
      
      this._updateCarousel(startPage);
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
         
         page = this.dataPage.getPreviousPage();
         
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
   