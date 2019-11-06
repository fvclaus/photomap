"use strict"

/**
 * @author Frederik Claus
 * @class Handles any form of input. Takes care of form validation, error handling and closing the input dialog
 */

define([
  "dojo/_base/declare",
  "../view/DialogMessageView",
  "../util/PhotoFileValidator",
  "dojo/domReady!"
],
function (declare, DialogMessageView, PhotoFileValidator) {
  $.extend($.ui.dialog.prototype.options, {
    autoOpen: false,
    modal: true,
    zIndex: 3000,
    draggable: false,
    closeOnEscape: false
  })

  return declare(null, {
    constructor: function () {
      this.visible = false
      // indicates if the user submitted the form
      this.abort = true
      // this.editor = new PhotoEditorView();
      this.photoValidator = new PhotoFileValidator()

      this._bindListener()

      this.INPUT_DIALOG = 0
      this.CONFIRM_DIALOG = 1
      this.ALERT_DIALOG = 2
    },
    /**
      * @author Frederik Claus, Marc Römer
      * @description load Input form, then overlay with jquery ui dialog widget
      * @param String url Url of the input-form
      */
    show: function (options) {
      var instance = this
      var $wrapper = $("#mp-dialog")
      assertTrue($wrapper.length === 1, "Must provide wrapper for dialog")
      this.$dialog = $("<div/>").appendTo($wrapper)

      this.options = $.extend({}, { type: this.INPUT_DIALOG, context: this }, options)
      // load html, add the title and the resize the box
      this._prepareDialog(this.options)

      this.active = true

      this.$dialog.dialog("option", {
        close: function () {
          instance.$dialog.empty()
          instance.$dialog.dialog("destroy")
          instance.setVisibility(false)
          instance.active = false
          console.log("DialogView: closed")
          // in case the user did not submit or a network/server error occurred and the dialog is closed
          if (instance.abort) {
            instance._trigger(instance.options, "abort")
          }
          instance.$dialog.remove()
        },
        open: function () {
          instance.$loader = $("<img src='/static/images/light-loader.gif'/>").appendTo("div.ui-dialog-buttonpane").hide()
          instance._submitHandler()
          instance.setVisibility(true)
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
    setVisibility: function (bool) {
      this.visible = bool
    },
    // TODO dialog("close") seems to trigger another dialog("open") which will set the visiblity to true again. See the DialogViewTest autoClose. Wtf?!
    isVisible: function () {
      return this.visible
    },
    close: function () {
      this.$dialog.dialog("close")
      this.message = null
      this.$close = null
      this.$form = null
    },
    showResponseMessage: function (response) {
      var height = this.$dialog.children().eq(0).height()
      if (!response.success) {
        this.$loader.hide()
        this.message.showFailure(response.error)
        this._scrollToMessage(height)
        this.$close.button("enable")
        return
      }
      // set only when the request did not produce an error
      this.abort = false
      this._trigger(this.options, "success", response)

      if (this.message.isAutoClose()) {
        this.close()
      } else {
        this.$loader.hide()
        this.message.showSuccess()
        this._scrollToMessage(height)
        this.$close.button("enable")
      }
    },
    showNetworkError: function () {
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
    // TODO This feature has been put on hold temporarily.
    startPhotoEditor: function () {
      assertTrue(this.$form, "Form has to be loaded before settings its input values")
      assertTrue(this.options.isPhotoUpload, "Editor is not available unless it is a photo upload")
      var instance = this
      this.$form.find("input[name='" + this.options.photoInputName + "']").bind("change", function (event) {
        instance.photoValidator.validate($(this), event)
        // input.editor.edit.call(input.editor, event);
      })
    },
    _prepareDialog: function (options) {
      var $wrapper = this._wrapContentNode(options.contentNode)
      var dimension = this._calculateDimensions()

      // add the html without the title
      this.$dialog
        .empty()
        .append($wrapper)
      // turn buttons into jquery ui buttons if present
      this._findButton().button()
      // resize the dialog to fit the content without scrolling
      // we must add a new dialog here
      this.$dialog.dialog({
        title: options.title,
        // TODO height is a messy business. height includes the title bar (wtf?!)
        // the dialog content is styled in percent of the parent.
        // this makes it impossible to calculate dimension of a dialog, because they depend on the dimension of the parent.
        // limit maximum height
        // maxHeight: dimension.height,
        width: dimension.width
      })
    },
    _findForm: function () {
      return this.$dialog.dialog("widget").find("form")
    },
    _findButton: function () {
      return this.$dialog.find("button, input[type='submit']")
    },
    _wrapContentNode: function (contentNode) {
      return $("<div/>").css("display", "inline-block").append(contentNode)
    },
    /**
      * @private
      */
    _submitHandler: function () {
      var instance = this
      var $widget = this.$dialog.dialog("widget")

      // set temporary properties
      var $form = $widget.find("form")
      this.message = new DialogMessageView($widget)
      this.$close = $widget.find("ui-dialog-titlebar-close")
      // called when data is valid
      $form.validate({
        success: "valid",
        errorPlacement: function () {}, // don't show any errors
        submitHandler: function () {
          instance._findButton().button("disable")
          instance.$loader.show()
          instance._trigger(instance.options, "submit", instance._getFormData($form))
        }
      })
      this._trigger(this.options, "load")
    },
    _getFormData: function ($form) {
      var formData = {}

      $form.find("input, textarea").each(function (input) {
        var name = $(input).attr("name")
        if (name !== this.options.photoInputName) {
          formData[name] = $(input).val()
        } else {
          formData[this.options.photoInputName] = this.photoValidator.getFile()
        }
      })

      return formData
    },
    _scrollToMessage: function (message) {
      this.$dialog.stop().animate({
        scrollTop: message
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
        if (instance.active) {
          instance.close()
        }
      })
    },
    _calculateDimensions: function () {
      var $parent = this.$dialog.parent().parent()
      return {
        width: 0.6 * $parent.width(),
        height: 0.75 * $parent.height()
      }
    }
  })
})
