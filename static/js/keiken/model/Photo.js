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
      if (data) {
        this.photo = data.photo
        this.thumb = data.thumb
        this.order = data.order
        this.visited = !!(data.visited)
      }
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
    },
    _overrideAjaxSettings: function (newData) {
      return {
        processData: false,
        contentType: false,
        cache: false,
        data: this._parseFormData(newData)
      }
    },
    _parseFormData: function (data) {
      var formData = new FormData()

      formData.append("place", data.place)
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("photo", data.photo)

      return formData
    }
  })
})
