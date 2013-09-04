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

define(["dojo/_base/declare",
        "../model/Photo"],
       function (declare, Photo) {
          return declare(null, {
             constructor : function (photos, photosPerPage, srcPropertyName) {
                assertTrue(photos instanceof Array, "Parameter photos must be of type Array.");
                assertNumber(photosPerPage);
                assertTrue(photosPerPage >= 1);
                assertString(srcPropertyName, "Need property name to reduce the photo later");
                
                this.pages = [];
                this._createPages(photos, photosPerPage);
                this.photos = photos;
                this._setCurrentPage(0);
                this.photosPerPage = photosPerPage;
                this.srcPropertyName = srcPropertyName;
                this.currentPageIndex = 0;
             },
             reset : function () {
                this.currentPageIndex = 0;
             },
             update : function (photos) {
                this._createPages(photos, this.photosPerPage);
             },
             /**
              * @public
              * @description returns page with given index
              */
             getPage : function (which) {
                assertTrue(typeof which === "string" || typeof which === "number" || which instanceof Photo, "which has to be string or number or Photo");
                
                var index = 0, 
                    photo = null;
                
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
                      this._setCurrentPage((this.currentPageIndex + 1) % this.pages.length);
                      break;
                   case "previous":
                      this._setCurrentPage((this.currentPageIndex + this.pages.length - 1) % this.pages.length);
                      break;
                   case "current":
                      break;
                   case "number":
                      this._setCurrentPage(index);
                      break;
                   case "photo":
                      this._setCurrentPage(this.getPageIndex(photo));
                      break;
                   default:
                      throw new Error("Unknown param: " + which);
                }


                return this._getCurrentPage();
             },
             /**
              * @public
              * @description Returns the index of the page that the photo has been assigned to.
              */
             getPageIndex : function (photo) {
                assertTrue(photo instanceof Photo, "getPageIndex just accepts a Photo as input param");
                
                var index = -1;
                
                this.pages.forEach(function (page, pageIndex) {
                   page.forEach(function (photoOnPage) {
                      if (photo === photoOnPage) {
                         index = pageIndex;
                      }
                   });
                });
                
                return index;
             },
             /**
              * @public
              */
             getCurrentPageIndex : function () {
                return this.currentPageIndex;
             },
             /**
              * @public
              * @description Returns the index of the photo local to the current page. The index can only be in the range of 0..photosPerPage.
              * Returns -1, if the photo is not on the current page.
              */
             getLocalPhotoIndex : function (photo) {
                var photoIndex = 0,
                    currentPage = this._getCurrentPage();
                
                for (photoIndex = 0; photoIndex < currentPage.length; photoIndex++) {
                   if (currentPage[photoIndex] === photo) {
                      return photoIndex;
                   }
                }
                return -1;
             },
             /**
              * @public
              */
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo);
                assertTrue(this.photos.indexOf(photo) !== -1, "The photo needs to be inserted to the original array before.");
                console.log("PhotoPages: Inserting photo %s into pages.", photo);
                // Repage
                this._createPages(this.photos, this.photosPerPage);
             },
             /**
              * @public
              */
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo);
                assertTrue(this.photos.indexOf(photo) === -1, "The photo needs to be removed from the original photo array before.");
                console.log("PhotoPages: Deleting photo %s from pages.", photo.getId());
                
                // Repage
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
             getNPages : function () {
                return this.pages.length;
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
                return this._extractSources(this.photos);
             },
             /**
              * @private
              * @description Maps photos to their source attribute
              */
             _extractSources : function (photos) {
                var sources = [],
                    instance = this;

                // extract sources
                photos.forEach(function (photo) {
                   if (photo !== null) {
                      sources.push(photo[instance.srcPropertyName]);
                   } else {
                      sources.push(null);
                   }
                });

                return sources;
             },
             getAllPhotos : function () {
                return this.photos;
             },

             /**
              * @private
              * @description Creates pages of photo. Updates old pages in memory or creates new pages.
              */
             _createPages : function (photos, photosPerPage) {
                assertTrue(photos instanceof Array);
                assertNumber(photosPerPage);

                console.log("PhotoPages: Paging %d photos to %d photos/page.", photos.length, photosPerPage);

                var page = null,
                    photoIndex = 0,
                    localPageIndex = 0,
                    lastPhotoIndex = photos.length - 1,
                    pageIndex = 0;
                    
                while (true) {
                   // Try to get the existing page from memory.
                   page = this.pages[pageIndex];
                   // If non exists, create a new one.
                   if (page === undefined) {
                      page = [];
                      this.pages.push(page);
                   }
                   // Update page with remaining photos.
                   // Fill up with null values if necessary.
                   for (localPageIndex = 0; localPageIndex < photosPerPage; localPageIndex++) {
                      page[localPageIndex] = null;
                      if (photos[photoIndex] !== undefined) {
                         page[localPageIndex] = photos[photoIndex];
                      }
                      // Keep track of the next photo.
                      photoIndex += 1;
                   }
                   pageIndex += 1;
                   // Checks if another page needs to be created.
                   if (photoIndex > lastPhotoIndex) {
                      // Delete old pages that are no longer necessary, because entries have been deleted.
                      this.pages.splice(pageIndex, this.pages.length - pageIndex);
                      break;

                   }
                }
             },

             /**
              * @private
              */
             _getCurrentPage : function () {
                return this.pages[this.currentPageIndex];
             },
             /**
              * @private
              */
             _setCurrentPage : function (index) {
                console.log("PhotoPages: Current page is now %d.", index);
                assertTrue(this.pages[index] !== undefined, "There is no page for index " + index + ". You have to provide a valid index.");
                
                this.currentPageIndex = index;
             }
          });
       });