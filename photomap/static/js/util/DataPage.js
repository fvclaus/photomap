/*jslint */
/*global $, main */

"use strict";

/**
 * @author Frederik Claus
 * @class Contains data divided into any number of pages
 */

var DataPage;

DataPage = function (data, entriesPerPage) {
   
   this.pages = this._create(data, entriesPerPage);
   this.currentPage = null;
   this.currentPageNumber = null;
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
   _create : function (data, columns) {
      
      var matrix, i, j, k, rest, m;
      i = 0;
      j = 0;
      k = 0;
      matrix = [];
      matrix[0] = [];
      rest = data.length % columns;
      
      // fill up empty slot with null
      if (rest !== 0) {
         
         for (m = 0; m < rest; m++) {
            data.push(null);
         }
      }
      
      // create a matrix with all pages as separate array
      while (i <= columns) {
         matrix[k].push(data[j]);
         if (j === data.length - 1) {
            break;
         }
         if (i === columns - 1) {
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
      this.currentPage = this.pages[index];
      this.currentPageNumber = index;
   },
   
   /**
    * @private
    */
   _isLastPage : function () {
      
      return (this.currentPage === this.pages[this.pages.length - 1]);
   },
   /**
    * @private
    */
   _isFirstPage : function () {
      
      return (this.currentPage === this.pages[0]); 
   },
   
   /**
    * @description returns page with given index - used 
    */
   getPage : function (index) {
      
      this._setCurrentPage(index);
      
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
         this._setCurrentPage(this.currentPageNumber + 1);
      }
      
      return this.currentPage;
   },
   
   getPreviousPage : function () {
      
      if (this.currentPage === null) {
         throw new Error("PageNotInitialized");
      } else if (this._isFirstPage()) {
         throw new Error("IndexOutOfBounds");
      } else {
         this._setCurrentPage(this.currentPageNumber - 1);
      }
      
      return this.currentPage;
   }
};