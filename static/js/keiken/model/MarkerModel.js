"use strict"

/**
 * @author Marc-Leon Römer, Frederik Claus
 * @class Base class for both Album and Place.
 */

define(["dojo/_base/declare",
  "./Model"],
function (declare, Model) {
  return declare(Model, {
    constructor: function (data) {
      if (data) {
        this.lat = data.lat
        this.lng = data.lng || data.lon
      }
    },
    /**
      * @public
      * @returns {float} Latitude
      */
    getLat: function () {
      return this.lat
    },
    /**
      * @public
      * @returns {float} Longitude
      */
    getLng: function () {
      return this.lng
    }
  })
})
