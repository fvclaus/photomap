"use strict"

define([
  "dojo/_base/declare",
  "./_DomTemplatedWidget",
  "../util/Communicator",
  "dojo/text!./templates/ModelOperation.html",
  "dojo/mouse"],
function (declare, _DomTemplatedWidget, communicator, template) {
  return declare(_DomTemplatedWidget, {
    templateString: template,
    viewName: "ModelOperation",

    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      this.includeShareOperation = params.includeShareOperation
      this._isMouseInsideWidget = false
      this._modelInstance = null
    },

    /**
      * @public
      * @description Displays operation controls below or above Model representation
      * @param options.modelInstance {Photo,Place,Album}
      * @param options.offset {Object} Contains top and left attribute. For Place & Album top needs to be the bottom.
      * @param options.dimension {Object} Contains width.
      */
    show: function (options) {
      this._modelInstance = options.modelInstance

      var width = options.dimension.width
      var center = {
        top: options.offset.top - this.$domNode.outerHeight(true),
        left: options.offset.left + width / 2
      }

      if (this.hideControlsTimeoutId) {
        window.clearTimeout(this.hideControlsTimeoutId)
      }

      // show controls
      this._showMarkerControls(center)
    },

    /**
      * @description Hides the operation controls.
      * @param {Boolean} hideAfterDelay if the controls should be hidden after a delay, when the controls are not entered again.
      * @param {Integer} delayInMs
      */
    hide: function () {
      if (this._isMouseInsideWidget) {
        return
      }
      this.$domNode.hide()
    },
    hideAfterDelay: function (delayInMs) {
      this.hideControlsTimeoutId = window.setTimeout(this.hide.bind(this), delayInMs || 2000)
    },

    /**
      * @description Controls are instantiated once and are used for albums, places and photos
      * @param {Object} center The bottom center of the element where the controls should be displayed
      * @private
      */
    _showMarkerControls: function (center) {
      center.left -= this.$domNode.outerWidth(true) / 2

      this.$domNode.css({
        top: center.top,
        left: center.left,
        display: "inline-block"
      })
    },
    publishOperation: function (event) {
      var operationName = event.target.getAttribute("data-operation-name")
      if (operationName) {
        communicator.publish("clicked:" + operationName, this._modelInstance)
      } else {
        console.error(event.target + " has no data-operation-name")
      }
    },
    onMouseEvent: function (event) {
      if (event.type === "mouseenter") {
        this._isMouseInsideWidget = true
      } else if (event.type === "mouseleave") {
        this._isMouseInsideWidget = false
        this.hide()
      }
    }
  })
})
