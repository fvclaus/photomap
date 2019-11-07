"use strict"

/**
 * @author Frederik Claus
 * @class Shows the feedback (success or failure) in DialogView
 */

define([
  "dojo/_base/declare",
  "../widget/_DomTemplatedWidget",
  "../util/ClientState",
  "dojo/text!./templates/DialogMessage.html",
  "dojo/domReady!"
],
function (declare, View, clientstate, templateString) {
  return declare(View, {
    viewName: "DialogMessageWidget",
    templateString: templateString,
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {

    },
    startup: function () {
      this.inherited(this.startup, arguments)
      this.$container.hide()
      this.$success.hide()
      this.$failure.hide()
      this.$autoCloseInput
        .prop("checked", clientstate.getDialogAutoClose())
    },
    _bindListener: function () {
      this.$autoCloseInput
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
