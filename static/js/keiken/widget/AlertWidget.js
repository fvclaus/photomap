"use strict"

define([
  "dojo/_base/declare",
  "./Main",
  "./AppController",
  "./AppModelController",
  "../util/Communicator",
  "./UIState",
  "../util/ClientState",
  "../model/Album",
  "../util/InfoText"
],
function (declare, main, AppController, AppModelController, communicator, state, clientstate, Album, InfoText) {
  return declare(_DomTemplatedWidget, {
    viewName: "",
    templateString: templateString,

    startup: function (message, options) {
      this.options = $.extend({}, {
        hideOnMouseover: true,
        hideOnClick: false,
        hideOnEscape: false,
        openOnMouseleave: false,
        fadingTime: 200
      }, options)
      this.$mask = null
      this.message = message
      this.closed = true
      this.started = false
      this.alertAttributes = {
        prepared: false,
        closed: true,
        $mask: null,
        $textContainer: null,
        isRead: false
      }
      this.id = $(".mp-infotext").size()
    },
    /**
          * @desription closes the InfoText. InfoText can just be opened again by calling this.open - it does not get visible automatically
          */
    close: function (closed) {
      if (this.started && (this.$infoText.is(":visible") || !this.closed)) {
        this.$infoText.fadeOut(this.options.fadingTime)
        if (this.$mask) {
          this.$mask.fadeOut(this.options.fadingTime)
        }
        if (closed !== undefined) {
          this.closed = closed
        } else {
          this.closed = true
        }
      }
      return this
    },
    // @description imitates an alert displaying the given message - doesn't require InfoText to be started or $container & options to be set
    alert: function (message) {
      var instance = this

      if (!this.alertPrepared) {
        this._prepareAlert()
      }

      // we can trust the message -> html is ok
      this.alertAttributes.$textContainer.find("span").html(message)

      this.alertAttributes.$textContainer.fadeIn(this.options.fadingTime, function () {
        instance.alertAttributes.closed = false
      })
      this.alertAttributes.$mask.fadeIn(this.options.fadingTime)

      // prevent accidental closing of alert -> show for at least 2s
      this.alertAttributes.isRead = false
      window.setTimeout(function (instance) {
        instance.alertAttributes.isRead = true
      }, 2000, this)
      return this
    },
    /**
          * @description removes the InfoText from the page.
          */
    destroy: function () {
      if (this.started) {
        this.$infoText.hide()
        this._unbindListener()
        this.$infoText.remove()
        this.$infoText = null
        this.started = false
      }

      return this
    },
    _prepareAlert: function () {
      if ($("#mp-mask").length > 0) {
        this.alertAttributes.$mask = $("#mp-mask")
      } else {
        this.alertAttributes.$mask = $("<div id='mp-mask'></div>").appendTo("body")
      }
      if ($("#mp-infoalert").length > 0) {
        this.alertAttributes.$textContainer = $("#mp-infoalert")
      } else {
        this.alertAttributes.$textContainer = $("<div id='mp-infoalert'><div><span></span></div></div>").appendTo("body")
      }
      this.alertAttributes.$textContainer.append("<p id='mp-infotext-closing-help'>" + gettext("CLOSE_INFOTEXT_ALERT") + "</p>")
      this._bindAlertListener()
      this.alertAttributes.prepared = true
    },
    _closeAlert: function (instance) {
      if (this.alertAttributes.prepared && (this.alertAttributes.$textContainer.is(":visible") || !this.alertAttributes.closed)) {
      // prevent accidental closing of alerts -> user is supposed to read the alert cause it gives important information
        if (!this.alertAttributes.isRead) {
          return false
        }
        this.alertAttributes.$textContainer.fadeOut(this.options.fadingTime)
        this.alertAttributes.$mask.fadeOut(this.options.fadingTime)
        this.alertAttributes.closed = true
        return true
      }
      return false
    },
    _bindAlertListener: function () {
      var instance = this
      var click = function () {
        instance.alertAttributes.$textContainer.stop(true, true)
        instance.alertAttributes.$mask.stop(true, true)
        instance._closeAlert()
      }
      this.alertAttributes.$mask.on("click", click)
      this.alertAttributes.$textContainer.on("click", click)
    },
    _unbindListener: function () {
      this.$infoText.off(".InfoText")
      this.$container.off(".InfoText")
      $(window).off("resize.InfoText-" + this.id)
    },
    _bindListener: function () {
      var instance = this
      // use fadeOut instead of this.close here, so that InfoText gets visible again after mouse leaves the $container
      this.$infoText
        .on("mouseenter.InfoText", function (event) {
          if (instance.options.hideOnMouseover && instance.started && !instance.closed) {
            instance.$infoText.stop(true, true)
            instance.$infoText.fadeOut(instance.options.fadingTime)
          }
        })
        .on("click.InfoText", function (event) {
          if (instance.options.hideOnClick && instance.started && !instance.closed) {
            instance.close(!instance.options.openOnMouseleave)
          }
        })
      this.$container.on("mouseleave.InfoText", function (event) {
        if ((instance.options.hideOnMouseover || instance.options.openOnMouseleave) && instance.started && !instance.closed) {
          instance.$infoText.stop(true, true)
          instance.$infoText.fadeIn(instance.options.options.fadingTime)
        }
      })
      $(document).on("keyup.InfoText", null, "esc", function (event) {
      // if alert is open close it and leave everything else as it is
        if (!instance.alertAttributes.closed) {
          instance._closeAlert()
          return
        }
        if (instance.options.hideOnEscape && instance.started && !instance.closed) {
          instance.$infoText.stop(true, true)
          instance.close(!instance.options.openOnMouseleave) // if openOnMouseleave is false -> fully close, else just hide
        }
      })
    }
  })
})
