"use strict"

/**
 * Place.js
 * @author Frederik Claus
 * @class Place stores several pictures and is itself stored in the map
 */

define(["dojo/_base/declare",
  "./MarkerModel",
  "./Photo",
  "./Collection",
  "../util/Communicator"],
function (declare, MarkerModel, Photo, Collection) {
  return declare(MarkerModel, {
    constructor: function (data) {
      this.type = "Place"
      var photos = []
      var rawPhotoData = (data && data.photos) || []
      rawPhotoData.forEach(function (photoData) {
        photos.push(new Photo(photoData))
      })
      this.photos = new Collection(photos, {
        modelType: "Photo",
        orderBy: "order"
      })
    },
    _updateProperties: function (data) {
      // Ignore photo property. It can only be changed in the frontend.
      delete data.photos
      this.inherited(this._updateProperties, arguments, [data])
    },

    /**
      * @description Get a photo by src
      * @returns {Photo}  Photo with src present, else null
      */
    getPhoto: function (src) {
      return this.photoCollection.getByAttribute("photo", src)
    },
    getPhotos: function () {
      return this.photos
    },
    isVisited: function () {
      return this.photos.reduce(function (acc, current) {
        return acc && current.visited
      }, true)
    }
  })
})
