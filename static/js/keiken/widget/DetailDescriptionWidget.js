"use strict"

/**
 * @author Marc-Leon Römer
 * @class shows description and titles of current Album/Place/Photo in several Places of the UI
 */

define([
  "dojo/_base/declare",
  "./_Widget",
  "../model/Model",
  "dojo/text!./templates/DetailDescription.html",
  "../util/Tools"
],
function (declare, _Widget, Model, templateString, tools) {
  return declare(_Widget, {
    viewName: "DetailWidget",
    templateString: templateString,
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      this.descriptionPlaceHolder = gettext("NO_DESCRIPTION")

      this.options = $.extend({}, {
        isAdmin: false,
        onShowDetail: function () {},
        onInsertDescription: function () {},
        abbreviateDescription: false
      }, params)
    },
    /**
      * @public
      * @description This will show the details or the teaser for the details of the model in question.
      * If the model is a Place or Album, the description & title will always be displayed in the detail box.
      * If the model is a Photo, the description & title will always be displayed in the teaser box
      * @param {Photo, Place, Album} model
      */
    show: function (model) {
      assertTrue(model instanceof Model)
      var description = model.description
      var title = model.type + ": " + model.title

      if (description && this.options.abbreviateDescription) {
        var shortDescription = tools.cutText(description, 250)
        // description is too long just for the teaser
        this.$detailLink.toggleClass("mp-nodisplay", shortDescription.length === description.length)
        description = shortDescription
      }

      this.$title.text(title)

      this.$description
        .text(description || this.descriptionPlaceHolder)

      this.options.isAdmin &&
        this.$insertDescription
          .toggleClass("mp-nodisplay", !!description)
    },
    /**
      * @public
      * @description Empties the teaser box if the input is the photo that is currently displayed in the teaser box.
      * If the input is the current displayed place or album, the detail box is emptied.
      * @param {Photo, Place, Album} model
      */
    empty: function () {
      this.$description.empty()
      this.$title.empty()
      this.options.isAdmin && this.$insertDescription.toggleClass("mp-display", true)
    },
    _onShowDetail: function () {
      this.options.onShowDetail()
    },
    _onInsertDescription: function () {
      this.options.onInsertDescription()
    }
  })
})
