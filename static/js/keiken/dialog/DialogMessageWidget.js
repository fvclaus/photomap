"use strict"

/**
 * @author Frederik Claus
 * @class Shows the feedback (success or failure) in DialogView
 */

define([
  "dojo/_base/declare",
  "../view/View",
  "../util/ClientState",
  "dojo/domReady!"
],
function (declare, View, clientstate) {
  return declare(View, {
    constructor: function ($el) {
      this.$el = $el
      this.$container = this.$el.find("#mp-dialog-message")
      this.$success = this.$container.find("#mp-dialog-message-success").hide()
      this.$failure = this.$container.find("#mp-dialog-message-failure").hide()
      this.$error = this.$failure.find("em")
      this.$autoClose = this.$el.find("input[name='auto-close']")
        .prop("checked", clientstate.getDialogAutoClose())
        .bind("change", function () {
          clientstate.setDialogAutoClose($(this).is(":checked"))
        })
    },
    showSuccess: function () {
      this.$container.show()
      this.$success.show("slow")
    },
    showFailure: function (error) {
      this.$container.show()
      this.$failure.show("slow")
      this.$error.html(error.toString())
    }
  })
})
