"use strict"

define(["dojo/_base/declare",
  "../util/Communicator",
  "./_Widget",
  "dojo/text!./templates/PageTitle.html"],
function (declare, communicator, _Widget, templateString) {
  return declare(_Widget, {
    viewName: "PageTitle",
    templateString: templateString,
    _bindListener: function () {
      this.$domNode.on("click", function () {
        communicator.publish("clicked:PageTitle")
      })
    },
    update: function (text) {
      this.$domNode.text(text)
    }
  })
})
