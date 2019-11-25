
"use strict"

/**
 * @author Marc-Leon Römer
 * @class provides methods to show basic tooltips over given elements
 */

// TODO Add listener for Esc and Return to enable closing of InfoText by pressing these keys, also implement Fullscreen overlay message (like alerts)

define(["dojo/_base/declare",
  "./_DomTemplatedWidget",
  "dojo/text!./templates/InfoText.html"],
function (declare, _DomTemplatedWidget, templateString) {
  return declare(_DomTemplatedWidget, {
    viewName: "",
    templateString: templateString,
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
    _unbindListener: function () {
      this.$message.off(".InfoText")
    },
    _bindListener: function () {
      // use fadeOut instead of this.close here, so that InfoText gets visible again after mouse leaves the $container.parent()
      this.$message
        .on("mouseenter.InfoText", function () {
          if (this.options.hideOnMouseover) {
            this.hide()
          }
        }.bind(this))
    }
  })
})
