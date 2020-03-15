"use strict"

define(["dojo/_base/declare",
  "../util/Communicator",
  "./_Widget"],
function (declare, communicator, _Widget) {
  return declare(_Widget, {
    _bindListener: function () {
      this.$domNode.on("click", function () {
        communicator.publish("clicked:PageTitle")
      })
    },
    update: function (text) {
      this.$pageTitle.text(text)
    }
  })
})
