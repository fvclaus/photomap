"use strict"

/**
 * @author Frederik Claus
 * @class Shows the feedback (success or failure) in DialogView
 */

define([
  "dojo/_base/declare",
  "../widget/_Widget",
  "../util/ClientState",
  "dojo/text!./templates/DialogMessage.html",
  "dojo/domReady!"
],
function (declare, _Widget, clientstate, templateString) {
  return declare(_Widget, {
    viewName: "DialogMessageWidget",
    templateString: templateString,
    startup: function () {
      this.inherited(this.startup, arguments)
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
      this.$success
        .toggleClass("mp-nodisplay", false)
        .show("slow")
    },
    showFailure: function (error) {
      this.$failure
        .toggleClass("mp-nodisplay", false)
        .show("slow")
      this.$error.html(error.toString())
    }
  })
})
