/*jslint */
/*global $, define, main, assertTrue, assertNumber, assertString  */

"use strict";

/**
 * @author Frederik Claus
 * @class Manages Photos on pages. Individual pages will always have the same length. The minimum amount of pages is 1. Pages will fill empty spots at the end with null values.
 * @param {Array<Photo>} Photos
 * @param {Number} photosPerPage Anything >= 1
 * @param {String} srcPropertyName Name of the property that is returned for every photo when a page is requested
 */

define(["dojo/_base/declare", "model/Photo"],
       function (declare, Photo) {
          return declare(null, {
             constructor : function (photos, photosPerPage, srcPropertyName) {
                assertTrue(photos instanceof Array);
                assertNumber(photosPerPage);
                assertTrue(photosPerPage >= 1);
                assertString(srcPropertyName, "Need property name to reduce the photo later");
                
                this.pages = [];
                this._createPages(photos, photosPerPage);
                this.photos = $.extend(true, [], photos);
                this._setCurrentPage(0);
                this.photosPerPage = photosPerPage;
                this.srcPropertyName = srcPropertyName;
                this.currentPageIndex = null;
             },
             update : function (photos) {
                this.pages = null;
                this.photos = $.extend(true, [], photos);
                this._createPages(photos, this.photosPerPage);
             },
             getCurrentPage : function () {
                //TODO this seems quite redundant.. the current-page is already stored so you can just return this._getCurrentPage() - why set the currentPageIndex = currentPageIndex again?
                //return this.getPage(this.currentPageIndex);
                return this._getCurrentPage();
             },
             /**
              * @public
              * @description returns page with given index
              */
             getPage : function (which) {
                assertTrue(typeof which === "string" || typeof which === "number" || which instanceof Photo, "which has to be string or number or Photo");
                
                var index, photo;
                
                if (typeof which === "number") {
                   index = which;
                   which = "number";
                } else if (which instanceof Photo) {
                   photo = which;
                   which = "photo";
                }
                
                switch (which) {
                   
                   case "first":
                      this._setCurrentPage(0);
                      break;
                   case "last":
                      this._setCurrentPage(this.pages.length - 1);
                      break;
                   case "next":
                      if (!this.currentPageIndex && this.currentPageIndex !== 0 || this.isLastPage()) {
                         this._setCurrentPage(0);
                      } else {
                         this._setCurrentPage(this.currentPageIndex + 1);
                      }
                      break;
                   case "previous":
                      if (!this.currentPageIndex && this.currentPageIndex !== 0 || this.isFirstPage()) {
                         this._setCurrentPage(this.pages.length - 1); 
                      } else {
                         this._setCurrentPage(this.currentPageIndex - 1);
                      }
                      break;
                   case "current":
                      break;
                   case "number":
                      this._setCurrentPage(index);
                      break;
                   case "photo":
                      index = this.getPageIndex(photo);
                      if (index === null) {
                         throw new Error("Unknown Photo: " + photo);
                      }
                      this._setCurrentPage(index);
                      break;
                   default:
                      throw new Error("Unknown param: " + which);
                      // this._setCurrentPage(0);
                      // break;
                }
                //TODO why the deep copy?
                //var currentPage =  $.extend(true, [], this._getCurrentPage());


                return this._getCurrentPage(); //currentPage;
             },
             getPageIndex : function (of) {
                assertTrue(of instanceof Photo, "getPageIndex just accepts a Photo as input param");
                
                var index = null;
                
                $.each(this.pages, function (pageIndex, page) {
                   $.each(page, function (photoIndex, photo) {
                      if (photo === of) {
                         index = pageIndex;
                      }
                   });
                });
                
                return index;
             },
             /**
              * @public
              */
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo);
                
                console.log("PhotoPages: Inserting photo %s into pages.", photo);
                this.photos.push(photo);
                this._createPages(this.photos, this.photosPerPage);
             },
             /**
              * @public
              */
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo);

                console.log("PhotoPages: Deleting photo %s from pages.", photo);
                var index = this.photos.indexOf(photo);
                this.photos.splice(index, 1);
                this._createPages(this.photos, this.photosPerPage);
                //the current page does not exist anymore. go back one
                if (this.pages[this.currentPageIndex] === undefined){
                   console.log("PhotoPages: Deleted page %d from pages. Going back one.", this.currentPageIndex);
                   this._setCurrentPage(this.currentPageIndex - 1);
                } else { //the current page still exists
                   this._setCurrentPage(this.currentPageIndex);
                }
             },
             /**
              * @public
              */
             isLastPage : function () {
                return this.currentPageIndex === this.pages.length - 1;
             },
             /**
              * @public
              */
             isFirstPage : function () {
                return this.currentPageIndex === 0;
             },
             /**
              * @public
              */
             getAllImageSources : function () {
                var photos =  $.extend(true, [], this.photos);
                
                return this._extractSources(photos);
             },
             getAllPhotos : function () {
                return this.photos;
             },
             /**
              * @public
              */
             getIndexOfPhoto : function (photo) {
                return this.photos.indexOf(photo);
             },
             /**
              * @private
              * @description Creates the photo pages
              */
             _createPages : function (photos, photosPerPage) {
                assertTrue(photos instanceof Array);
                assertNumber(photosPerPage);

                console.log("PhotoPages: Paging %d photos to %d photos/page.", photos.length, photosPerPage);

                var pages = [],
                    pageData = $.extend(true, [], photos), //make a deep copy so that the original data won't get modified
                    photoIndex = 0,
                    pageIndex = 0,
                    nPhotosLastPage = 0,
                    nEmptyPhotosLastPage = 0;

                
                pages[0] = [];
                //no entries: creating null x photosPerPage
                if (photos.length === 0) {
                   console.log("PhotoPages: Photos are emtpy. Filling first page with null values.");
                   for (photoIndex = 0; photoIndex < photosPerPage; photoIndex++){
                      pages[0][photoIndex] = null;
                   }
                }
                else{
                   nPhotosLastPage = pageData.length % photosPerPage;
                   // fill up empty slot with null
                   if (nPhotosLastPage !== 0) {
                      nEmptyPhotosLastPage = photosPerPage - nPhotosLastPage;
                      console.log("PhotoPages: Filling the last page with %d empty photos.", nEmptyPhotosLastPage);

                      for (photoIndex = 0; photoIndex < nEmptyPhotosLastPage; photoIndex++) {
                         pageData.push(null);
                      }
                   }
                   
                   pageIndex = 0;
                   // create a matrix with all pages as separate array
                   for (photoIndex = 1; photoIndex <= pageData.length; photoIndex++){
                      pages[pageIndex].push(pageData[photoIndex - 1]);
                      // photo is not the last one
                      if (photoIndex !== pageData.length){
                         // photo is not the first one, expect the pageSize is 1
                         if (photosPerPage > 1 && photos === 1){
                            continue;
                         }
                         // photoIndex is exactly divided by photosPerPage. start a new page
                         if (photoIndex % photosPerPage === 0) {
                            pages.push([]);
                            pageIndex++;
                         }
                      }
                   }
                   console.log("PhotoPages: Created %d pages in total.", pages.length);
                }
                this.pages = pages;
             },
             /**
              * @private
              * @description Maps photos to their source attribute
              */
             _extractSources : function (photos) {
                var sources = [],
                    instance = this;

                // extract sources
                //NOTE: $.map will remove all entries that return null
                photos.forEach(function (photo) {
                   if (photo !== null) {
                      sources.push(photo[instance.srcPropertyName]);
                   } else {
                      sources.push(null);
                   }
                });

                return sources;
             },
             /**
              * @private
              */
             _getCurrentPage : function () {
                //TODO what was this for? _setCurrentPage sets this.currentPageIndex, so this call just sets this.currentPageIndex = this.currentPageIndex;
                //this._setCurrentPage(this.currentPageIndex);
                
                var currentPage = this.pages[this.currentPageIndex];
                
                currentPage.forEach(function (photo) {
                   assertTrue(photo instanceof Photo || photo === null, "Pages may just contain Photos or nulls");
                });
                
                return currentPage;
             },
             /**
              * @private
              */
             _setCurrentPage : function (index) {
                //TODO setting currentPage is prone to error when we update the pages Array. Only store currentPageIndex
                console.log("PhotoPages: Current page is now %d.", index);
                assertTrue(this.pages[index] !== undefined, "There is no page with given index. You have to provide a valid index.");
                
                this.currentPageIndex = index;
             }
          });
       });