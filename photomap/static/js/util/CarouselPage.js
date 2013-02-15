/*jslint */
/*global $, main */

"use strict";

/**
 * @author Frederik Claus
 * @class Contains data divided into any number of pages
 */


var CarouselPage  = function (entries, entriesPerPage) {
   
   this._createPages(entries, entriesPerPage);
   this.entries = $.extend(true, [], entries);
   this.entriesPerPage = entriesPerPage;
};

/**
 * @author Marc-Leon Roemer
 * @description defines handler to create the page-matrix and to navigate through the pages
 */
CarouselPage.prototype = {
   
   /**
    * @private
    * @description Takes data-array and the entriesPerPage-integer and creates a matrix with the pages as rows and the entries as columns 
    */
   _createPages : function (entries, entriesPerPage) {
      
      var pages = [],
         pageData = $.extend(true, [], entries), //make a deep copy so that the original data won't get modified
         i = 0,
         j = 0,
         k = 0,
         rest = 0,
         m;
      
      pages[0] = [];
      //no entries: creating null x entriesPerPage
      if (entries.length === 0) {
         for (i = 0; i < entriesPerPage; i++){
            pages[0][i] = null;
         }
      }
      else{
         rest = pageData.length % entriesPerPage;
         // fill up empty slot with null
         if (rest !== 0) {
            
            for (m = 0; m < (entriesPerPage - rest); m++) {
               pageData.push(null);
            }
         }
         
         // create a matrix with all pages as separate array
         for (i = 1; i <= pageData.length; i++){
            pages[k].push(pageData[i - 1]);
            // i is not the end
            if (i !== pageData.length){
               // i is not the beginning expect the pageSize is 1
               if (entriesPerPage > 1 && entries === 1){
                  continue;
               }
               // i is exactly divided by entriesPerPage. start a new page
               if (i % entriesPerPage === 0) {
                  pages.push([]);
                  k++;
               }
            }
         }
      }
      this.pages = pages;
   },
   insertEntry : function (entry) {
      this.entries.push(entry);
      this._createPages(this.entries, this.entriesPerPage);
   },
   deleteEntry : function (entry) {
      var index = this.entries.indexOf(entry);
      this.entries.splice(index, 1);
      this._createPages(this.entries, this.entriesPerPage);
      //the current page does not exist anymore. go back one
      if (this.pages[this.currentPageIndex] === undefined){
         this._setCurrentPage(this.currentPageIndex - 1);
      }
      //the current page still exists
      else{
         this._setCurrentPage(this.currentPageIndex);
      }
   },
   /**
    * @private
    */
   _setCurrentPage : function (index) {
      //TODO setting currentPage is prone to error when we update the pages Array. Only store currentPageIndex
      if (this.pages[index] === undefined){
         throw new Error("Page "+index+" is undefined");
      }
      this.currentPageIndex = index;
   },
   getCurrentPage : function () {
      this._setCurrentPage(this.currentPageIndex);
      return this.pages[this.currentPageIndex];
   },
   /**
    * @private
    */
   isLastPage : function () {
      
      return this.currentPageIndex === this.pages.length - 1;
   },
   /**
    * @private
    */
   _isFirstPage : function () {
      return this.currentPageIndex === 0;
   },
   getCurrentPageNumber : function () {
      return this.currentPageNumber;
   },
   /**
    * @description returns page with given index
    */
   getPage : function (index) {
      this._setCurrentPage(index);
      return this.getCurrentPage();
   },
   
   getFirstPage : function () {
      this._setCurrentPage(0);
      return this.getCurrentPage();
   },
   
   getLastPage : function () {
      this._setCurrentPage(this.pages.length - 1);
      return this.getCurrentPage();
   },
   
   getNextPage : function () {
      if (this.isLastPage()) {
         return this.getFirstPage();
      } else {
         this._setCurrentPage(this.currentPageIndex + 1);
         return this.getCurrentPage();
      }
   },
   
   getPreviousPage : function () {
      if (this._isFirstPage()) {
         return this.getLastPage();
      } else {
         this._setCurrentPage(this.currentPageIndex - 1);
         return this.getCurrentPage();
      }
   },
   getAllEntries : function () {
      return $.extend(true, [], this.entries);
   },
   getIndexOfEntry : function (entry) {
      return this.entries.indexOf(entry);
   }
};