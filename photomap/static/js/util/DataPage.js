/*jslint */
/*global $, main */

"use strict";

/**
 * @author Frederik Claus
 * @class Contains data divided into any number of pages
 */

var DataPage;

DataPage = function (data, entriesPerPage) {
   
   this.pages = this._init(data, entriesPerPage);
   this.currentPage = null;
};

/**
 * @author Marc-Leon Roemer
 * @description defines handler to create the page-matrix and to navigate through the pages
 */
DataPage.prototype = {
   
   /**
    * @private
    * @description Takes data-array and the entriesPerPage-integer and creates a matrix with the pages as rows and the entries as columns 
    */
   _init : function (data, entriesPerPage) {
      
      var matrix = [],
         pageData = $.extend(true, [], data), //make a deep copy so that the original data won't get modified
         i = 0,
         j = 0,
         k = 0,
         rest,
         m;
      
      matrix[0] = [];
      rest = pageData.length % entriesPerPage;
      // fill up empty slot with null
      if (rest !== 0) {
         
         for (m = 0; m < (entriesPerPage - rest); m++) {
            pageData.push(null);
         }
      }
      
      // create a matrix with all pages as separate array
      while (i <= entriesPerPage) {
         matrix[k].push(pageData[j]);
         if (j === pageData.length - 1) {
            break;
         }
         if (i === entriesPerPage - 1) {
            i = 0;
            j++;
            k++;
            matrix[k] = [];
         } else {
            i++;
            j++;
         }
      }
      
      return matrix;
   },
   /**
    * @private
    */
   _setCurrentPage : function (index) {
      this.currentPage = {
         page : this.pages[index],
         "index" : index
      };
   },
   
   /**
    * @private
    */
   _isLastPage : function () {
      
      return (this.currentPage.page === this.pages[this.pages.length - 1]);
   },
   /**
    * @private
    */
   _isFirstPage : function () {
      
      return (this.currentPage.page === this.pages[0]);
   },
   getCurrentPageNumber : function () {
   
      return this.currentPageNumber;
   },
   /**
    * @description returns page with given index
    */
   getPage : function (index) {

      if (index === null || index === undefined){
         throw new Error("IllegalArgument");
      }
         
      if (this.pages[index] === undefined) {
         throw new Error("IndexOutOfBounds");
      } else {
         this._setCurrentPage(index);
      }
      
      return this.currentPage;
   },
   
   getFirstPage : function () {
      
      this._setCurrentPage(0);
      
      return this.currentPage;
   },
   
   getLastPage : function () {
      
      this._setCurrentPage(this.pages.length - 1);

      return this.currentPage;
   },
   
   getNextPage : function () {
      
      if (this.currentPage === null) {
         throw new Error("PageNotInitialized");
      } else if (this._isLastPage()) {
         throw new Error("IndexOutOfBounds");
      } else {
         this._setCurrentPage(this.currentPage.index + 1);
      }
      
      return this.currentPage;
   },
   
   getPreviousPage : function () {
      
      if (this.currentPage === null) {
         throw new Error("PageNotInitialized");
      } else if (this._isFirstPage()) {
         throw new Error("IndexOutOfBounds");
      } else {
         this._setCurrentPage(this.currentPage.index - 1);
      }
      
      return this.currentPage;
   }
};