"use strict"

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation, error handling and closing the input dialog
 */

define([
  "dojo/_base/declare",
  "./DialogMessageWidget",
  "../util/PhotoFileValidator",
  "../util/ClientState",
  "dojo/domReady!"
],
function (declare, DialogMessageView, PhotoFileValidator, clientState) {
  $.extend($.ui.dialog.prototype.options, {
    autoOpen: false,
    modal: true,
    zIndex: 3000,
    draggable: false,
    closeOnEscape: false
  })
  var photoValidator = new PhotoFileValidator()

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
      var instance = this
      // Wrapper is used to determine width and height relative to parent.
      var $wrapper = $("#" + this.WRAPPER_ID)
      assertTrue($wrapper.length === 1, "Must provide wrapper for dialog")
      this.$dialog = $("<div/>").appendTo($wrapper)

      this.options = $.extend({}, { type: this.INPUT_DIALOG, context: this }, options)
      this._prepareDialog(this.options)

      this.$dialog.dialog("option", {
        close: function () {
          instance._unbindListener()
          instance.$dialog.empty()
          instance.$dialog.dialog("destroy")
          console.log("DialogView: closed")
          instance.$dialog.remove()
        },
        open: function () {
          instance._bindListener()
          instance.$loader = $("<img src='/static/images/light-loader.gif'/>").appendTo("div.ui-dialog-buttonpane").hide()
          instance._submitHandler()
          // focus for activation
          instance.$dialog.focus()
        }

      })

      switch (this.options.type) {
        case this.CONFIRM_DIALOG:
          this.$dialog.dialog("option", {
            buttons: [
              {
                id: "mp-dialog-button-yes",
                text: gettext("YES"),
                click: function () {
                  instance._submitForm()
                  return true
                }
              },
              {
                id: "mp-dialog-button-no",
                text: gettext("NO"),
                click: function () {
                  $(this).dialog("close")
                  return false
                }
              }
            ]
          })
          break

        case this.INPUT_DIALOG :
          this.$dialog.dialog("option", {
            buttons: [
              {
                id: "mp-dialog-button-save",
                text: gettext("SAVE"),
                click: function () {
                  instance._submitForm()
                }
              }
            ]
          })
          break

        case this.ALERT_DIALOG :
          this.$dialog.dialog("option", {
            buttons: [
              {
                id: "mp-dialog-button-ok",
                text: gettext("OK"),
                click: function () {
                  $(this).dialog("close")
                  return false
                }
              }
            ]
          })
          break
      }
      // if we open the dialog earlier the open callback from above will never be called
      this.$dialog.dialog("open")
    },
    close: function () {
      this.$dialog.dialog("close")
      this.message = null
      this.$close = null
      this.$form = null
    },
    showFailureMessage: function (response) {
      this.$loader.hide()
      this.message.showFailure(response.error)
      this._scrollToMessage()
      this.$close.button("enable")
    },
    showSuccessMessage: function () {
      if (clientState.getDialogAutoClose()) {
        this.close()
      } else {
        this.$loader.hide()
        this.message.showSuccess()
        this._scrollToMessage()
        this.$close.button("enable")
      }
    },
    showNetworkErrorMessage: function () {
      this.$loader.hide()
      this._scrollToMessage(this.message)
      this.message.showFailure(gettext("NETWORK_ERROR"))
      this.$close.button("enable")
    },
    setInputValue: function (name, value) {
      assertTrue(this.$form, "Form has to be loaded before settings its input values")
      var $input = this.$form.find("[name='" + name + "']")
      assertTrue($input.size() === 1, "The selected input field does not exist.")
      $input.val(value)
    },
    _prepareDialog: function (options) {
      var $dialogMessage = $("<div/>")
      this.$dialog
        .empty()
        .append(options.contentNode)
        .append($dialogMessage)
      this.message = new DialogMessageView(null, $dialogMessage.get(0))
      this._findButtons().button()
      this.$dialog.dialog({
        title: options.title,
        width: this._calculateWidth()
      })
    },
    _findForm: function () {
      return this.$dialog.dialog("widget").find("form")
    },
    _findButtons: function () {
      return this.$dialog.find("button, input[type='submit']")
    },
    /**
      * @private
      */
    _submitHandler: function () {
      var instance = this
      var $widget = this.$dialog.dialog("widget")

      // set temporary properties
      var $form = $widget.find("form")

      this.$close = $widget.find("ui-dialog-titlebar-close")
      // called when data is valid
      $form.validate({
        success: "valid",
        errorPlacement: function () {}, // don't show any errors
        submitHandler: function () {
          instance._findButtons().button("disable")
          instance.$loader.show()
          instance._trigger(instance.options, "submit", instance._getFormData($form))
        }
      })
    },
    _getFormData: function ($form) {
      var formData = {}

      $form.find("input, textarea").each(function (input) {
        var name = $(input).attr("name")
        if (name !== this.options.photoInputName) {
          formData[name] = $(input).val()
        } else {
          formData[this.options.photoInputName] = photoValidator.getFile()
        }
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
        options[name].call(options.context, args)
      }
    },
    _submitForm: function () {
      this.$dialog.dialog("widget").find("form").trigger("submit")
    },
    _bindListener: function () {
      var instance = this
      $("body").on("keyup.Dialog", null, "esc", function () {
        instance.close()
      })
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
