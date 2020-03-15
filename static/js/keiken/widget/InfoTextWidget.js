
"use strict"

/**
 * @author Marc-Leon Römer
 * @class provides methods to show basic tooltips over given elements
 */

define(["dojo/_base/declare",
  "./_Widget",
  "dojo/text!./templates/InfoText.html"],
function (declare, _Widget, templateString) {
  return declare(_Widget, {
    viewName: "InfoText",
    templateString: templateString,
    constructor: function () {
      this._extendDefaults()
    },
    _extendDefaults: function (options) {
      this.options = $.extend({}, {
        hideOnMouseover: true,
        fadingTime: 200,
        message: ""
      }, options)
    },
    show: function (options) {
      this._extendDefaults(options)
      this.$message.html(this.options.message)
      if (!this.$container.is(":visible")) {
        this.$container.show()
        this.$message
          .stop(true, true)
          .fadeIn(this.options.fadingTime)
      }
    },
    hide: function () {
      if (this.$container.is(":visible")) {
        this.$message
          .stop(true, true)
          .fadeOut(this.options.fadingTime, function () {
            this.$container.hide()
          }.bind(this))
      }
    },
    hideOnMouseoverIfConfigured: function () {
      if (this.options.hideOnMouseover) {
        this.hide()
      }
    }
  })
})
