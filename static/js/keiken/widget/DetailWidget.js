"use strict"

/**
 * @author Marc-Leon Römer
 * @class shows description and titles of current Album/Place/Photo in several Places of the UI
 */

define([
  "dojo/_base/declare",
  "./_Widget",
  "../model/Model",
  "../util/Communicator",
  "dojo/text!./templates/Detail.html",
  "./DetailDescriptionWidget"
],
function (declare, _Widget, Model, communicator, templateString) {
  return declare(_Widget, {
    viewName: "DetailWidget",
    templateString: templateString,
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      this.options = $.extend({}, {
        adminMode: false
      }, params)
      this._model = null
    },
    /**
      * @public
      * @description This will show the details or the teaser for the details of the model in question.
      * If the model is a Place or Album, the description & title will always be displayed in the detail box.
      * If the model is a Photo, the description & title will always be displayed in the teaser box
      * @param {Photo, Place, Album} model
      */
    show: function (model) {
      this._show(model, !this.hasChildren)
    },
    _show: function (model, showFullDescriptionWrapper) {
      assertTrue(model instanceof Model)
      if (this._model) {
        this._model.removeEvents(this.viewName)
      }
      this._model = model
      // TODO Make this API nicer.
      // TODO Check if this is still the displayed model.
      this._model.onUpdate(function (model) {
        this.show(model, showFullDescriptionWrapper)
      }, this, this.viewName)
      this._model.onDelete(function () {
        this.empty()
      }, this, this.viewName)

      if (showFullDescriptionWrapper) {
        this.fullDescription.show(model)
      } else {
        this.shortDescription.show(model)
      }

      this.$fullDescriptionWrapper.toggleClass("mp-nodisplay", !showFullDescriptionWrapper)
      this.$shortDescriptionWrapper.toggleClass("mp-nodisplay", showFullDescriptionWrapper)
    },
    /**
      * @public
      * @description Empties the teaser box if the input is the photo that is currently displayed in the teaser box.
      * If the input is the current displayed place or album, the detail box is emptied.
      * @param {Photo, Place, Album} model
      */
    empty: function () {
      this.fullDescription.empty()
      this.shortDescription.empty()
    },
    _close: function () {
      communicator.publish("closed:Detail")
      if (this.hasChildren) {
        this.show(this._model)
      }
    },
    _showFullDescription: function () {
      this._show(this._model, true)
    },
    _publishInsertDescription: function () {
      communicator.publish("clicked:DescriptionInsert", this._model)
    }
  })
})
