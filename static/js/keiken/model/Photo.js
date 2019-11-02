"use strict"

/**
 * @author Frederik Claus
 * @class is stored in a place object, encapsulation of an marker
 */

define(["dojo/_base/declare",
  "./Model"],
function (declare, Model) {
  return declare(Model, {
    constructor: function (data) {
      this.type = "Photo"
      this.photo = data.photo
      this.thumb = data.thumb
      this.order = data.order
      this.visited = !!(data.visited)
    },
    getOrder: function () {
      return this.order
    },
    getPhoto: function () {
      return this.photo
    },
    getThumb: function () {
      return this.thumb
    },
    getSource: function (srcPropertyName) {
      if (!this[srcPropertyName]) {
        throw new Error("UnknownPropertyError : " + srcPropertyName)
      }
      return this[srcPropertyName]
    },
    setVisited: function (visited) {
      this.visited = visited
    },
    isVisited: function () {
      return this.visited
    },
    toString: function () {
      return Number(this.id).toString()
    }
  })
})
