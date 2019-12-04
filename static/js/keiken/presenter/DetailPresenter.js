"use strict"

define([
  "dojo/_base/declare",
  "./Presenter"
],
function (declare, Presenter) {
  return declare(Presenter, {
    constructor: function (view, isSlider) {
      this.isSlider = isSlider
    },
    removeAddDescriptionLink: function () {
      this.view.removeAddDescriptionLink()
    },
    hideDetail: function () {
      this.view.hideDetail()
    },
    update: function (model) {
      this.view.update(model)
    },
    empty: function (model) {
      this.view.empty(model)
    },
    updateUsedSpace: function (data) {
      this.view.updateUsedSpace(data)
    },
    slideIn: function () {
      this.view.slideIn()
    },
    slideOut: function () {
      this.view.slideOut()
    },
    closeDetail: function () {
      if (this.isSlider) {
        this.slideOut()
      } else {
        this.hideDetail()
      }
    }
  })
})
