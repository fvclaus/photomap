"use strict"

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation, error handling and closing the input dialog
 */

define([
  "dojo/_base/declare",
  "./DialogMessageWidget",
  "../util/ClientState",
  "dojo/domReady!"
],
function (declare, DialogMessageView, clientState) {
  $.extend($.ui.dialog.prototype.options, {
    autoOpen: false,
    modal: true,
    zIndex: 3000,
    draggable: false,
    closeOnEscape: false
  })

  return declare(null, {
    constructor: function () {
      // this.editor = new PhotoEditorView();
      this.INPUT_DIALOG = 0
      this.CONFIRM_DIALOG = 1
      this.ALERT_DIALOG = 2

      this.WRAPPER_ID = "mp-dialog"
    },
    /**
      * @author Frederik Claus, Marc Römer
      * @description load Input form, then overlay with jquery ui dialog widget
      */
    show: function (options) {
      assertSchema({
        title: assertString,
        contentNode: assertObject,
        submit: assertFunction
      }, options)
      // Wrapper is used to determine width and height relative to parent.
      var $wrapper = $("#" + this.WRAPPER_ID)
      assertTrue($wrapper.length === 1, "Must provide wrapper for dialog")
      this.$dialog = $("<div/>").appendTo($wrapper)

      this.options = $.extend({}, {
        type: this.INPUT_DIALOG,
        thisContext: this,
        load: function () {}
      }, options)
      this._prepareDialog(this.options)

      this.$dialog.dialog({
        title: this.options.title,
        width: this._calculateWidth(),
        close: function () {
          this._unbindListener()
          this.message.destroy()
          this.$dialog
            .dialog("destroy")
            .remove()
          console.log("DialogView: closed")
        }.bind(this),
        open: function () {
          this._bindListener()
          this.$loader = $("<img src='/static/images/light-loader.gif'/>").appendTo("div.ui-dialog-buttonpane").hide()
          this._bindSubmitHandler()
          // focus for activation
          this.$dialog.focus()
        }.bind(this),
        buttons: this._createButtons(this.options.type)
      })

      // if we open the dialog earlier the open callback from above will never be called
      this.$dialog.dialog("open")
    },
    _createButtons: function (type) {
      switch (type) {
        case this.CONFIRM_DIALOG:
          return [
            this._createSubmitButton("mp-dialog-button-yes",
              gettext("YES")),
            this._createCloseButton("mp-dialog-button-no",
              gettext("NO"))]

        case this.INPUT_DIALOG :
          return [
            this._createSubmitButton("mp-dialog-button-save",
              gettext("SAVE"))
          ]

        case this.ALERT_DIALOG :
          return [
            this._createCloseButton("mp-dialog-button-ok",
              gettext("OK"))
          ]
      }
    },
    _createCloseButton: function (id, text) {
      return {
        id: id,
        text: text,
        click: function () {
          $(this).dialog("close")
          return false
        }
      }
    },
    _createSubmitButton: function (id, text) {
      return {
        id: id,
        text: text,
        click: function () {
          this._submitForm()
          return true
        }.bind(this)
      }
    },
    close: function () {
      this.$dialog.dialog("close")
    },
    showFailureMessage: function (response) {
      this.$loader.hide()
      this.message.showFailure(response.error)
      this._scrollToMessage()
      this._enableCloseButton()
    },
    showSuccessMessage: function () {
      if (clientState.getDialogAutoClose()) {
        this.close()
      } else {
        this.$loader.hide()
        this.message.showSuccess()
        this._scrollToMessage()
        this._enableCloseButton()
      }
    },
    showNetworkErrorMessage: function () {
      this.$loader.hide()
      this._scrollToMessage(this.message)
      this.message.showFailure(gettext("NETWORK_ERROR"))
      this._enableCloseButton()
    },
    _enableCloseButton: function () {
      this.$dialog.find("ui-dialog-titlebar-close").button("enable")
    },
    _prepareDialog: function (options) {
      var $dialogMessage = $("<div/>")
      this.$dialog
        .empty()
        .append(options.contentNode)
        .append($dialogMessage)
      this.message = new DialogMessageView(null, $dialogMessage.get(0))
      this.message.startup()
      this._findButtons().button()
    },
    _findForm: function () {
      return this.$dialog.dialog("widget").find("form")
    },
    _findButtons: function () {
      return this.$dialog.find("button, input[type='submit']")
    },
    _bindSubmitHandler: function () {
      this._findForm().validate({
        debug: true,
        success: "valid",
        submitHandler: function (form) {
          this._findButtons().button("disable")
          this.$loader.show()
          this._trigger(this.options, "submit", this._getFormData($(form)))
        }.bind(this)
      })

      this._trigger(this.options, "load")
    },
    _getFormData: function ($form) {
      var formData = {}
      // eslint-disable-next-line no-unused-vars
      $form.find("input, textarea").each(function (index, input) {
        var name = $(input).attr("name")
        formData[name] = $(input).val()
      })

      return formData
    },
    _scrollToMessage: function () {
      this.$dialog.stop().animate({
        scrollTop: this.message.$container.offset().top
      }, 300)
    },
    _trigger: function (options, name, args) {
      if (typeof options[name] === "function") {
        options[name].call(options.thisContext, args)
      }
    },
    _submitForm: function () {
      this._findForm().trigger("submit")
    },
    _bindListener: function () {
      $("body").on("keyup.Dialog", null, "esc", function () {
        this.close()
      }.bind(this))
    },
    _unbindListener: function () {
      $("body").off("keyup.Dialog")
    },
    _calculateWidth: function () {
      var $parent = this.$dialog.parent().parent()
      return 0.6 * $parent.width()
    }
  })
})
