"use strict"

define([
  "dojo/_base/declare",
  "./_Widget",
  "dojo/text!./templates/LoadingScreen.html"],
function (declare, _Widget, templateString) {
  return declare(_Widget, {
    templateString: templateString,
    viewName: "LoadingScreen",

    hide: function () {
      var hide = function () { this.$domNode.hide() }.bind(this)
      this.$message.text(gettext("Yay. The app is ready."))
      this.$loader.hide()
      this.$finish.show()
      window.setTimeout(hide, 1500)
    }
  })
})
