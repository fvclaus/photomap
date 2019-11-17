"use strict"

/**
 * @author Frederik Claus
 * @class Manages Photos on pages. Individual pages will always have the same length. The minimum amount of pages is 1. Pages will fill empty spots at the end with null values.
 * @param {Array<Photo>} Photos
 * @param {Number} photosPerPage Anything >= 1
 */
define(["dojo/_base/declare",
  "../model/Collection",
  "../model/Photo"],
function (declare, Collection, Photo) {
  return declare(null, {
    constructor: function (photos, photosPerPage) {
      assertTrue(photos instanceof Collection)
      assertNumber(photosPerPage)
      assertTrue(photosPerPage >= 1)

      this.photos = photos
      this.photosPerPage = photosPerPage
      this._currentPageIndex = 0
    },
    reset: function () {
      this._currentPageIndex = 0
    },
    /**
      * @public
      * @description returns page with given index
      */
    navigateTo: function (which) {
      assertTrue(typeof which === "string" || typeof which === "number" || which instanceof Photo, "which has to be string or number or Photo")

      var index = 0
      var photo = null

      if (typeof which === "number") {
        index = which
        which = "number"
      } else if (which instanceof Photo) {
        photo = which
        which = "photo"
      }

      var lastPageIndex = this._calculateLastPageIndex()

      switch (which) {
        case "first":
          this._currentPageIndex = 0
          break
        case "last":
          this._currentPageIndex = lastPageIndex
          break
        case "next":
          this._currentPageIndex = (this.getCurrentPageIndex() + 1) % (lastPageIndex + 1)
          break
        case "previous":
          this._currentPageIndex = (this.getCurrentPageIndex() + lastPageIndex) % (lastPageIndex + 1)
          break
        case "number":
          this._currentPageIndex = index
          break
        case "photo":
          this._currentPageIndex = this.getPageIndex(photo)
          break
        default:
          throw new Error("Unknown param: " + which)
      }

      return this.getCurrentPage()
    },
    /**
      * @public
      * @description Returns the index of the page that the photo has been assigned to.
      */
    getPageIndex: function (photo) {
      assertTrue(photo instanceof Photo, "getPageIndex just accepts a Photo as input param")

      var index = this.photos.indexOf(photo)
      return Math.floor(index / this.photosPerPage)
    },
    getCurrentPageIndex: function () {
      if (this._currentPageIndex > this._calculateLastPageIndex()) {
        console.log("PhotoPages: Deleted page %d from pages. Going back one.", this._currentPageIndex)
        this._currentPageIndex--
      }
      return this._currentPageIndex
    },
    getNPages: function () {
      return this._calculateLastPageIndex() + 1
    },
    isLastPage: function () {
      return this.getCurrentPageIndex() === this._calculateLastPageIndex()
    },
    isFirstPage: function () {
      return this.getCurrentPageIndex() === 0
    },
    getCurrentPage: function () {
      var photos = this.getCurrentPageWithoutPadding()
      for (var i = 0; i < this.photosPerPage; i++) {
        if (!photos[i]) {
          photos.push(null)
        }
      }
      return photos
    },
    getCurrentPageWithoutPadding: function () {
      var from = this.photosPerPage * this.getCurrentPageIndex()
      return this.photos.slice(from, from + this.photosPerPage)
    },
    _calculateLastPageIndex: function () {
      var lastPageIndex = this.photos.size() / parseFloat(this.photosPerPage)
      // Check for remaining photos
      if (lastPageIndex % 1 === 0) {
        lastPageIndex--
      }
      return Math.floor(lastPageIndex)
    }
  })
})
