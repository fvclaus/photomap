"use strict"

define([
  "dojo/_base/declare",
  "./_Widget",
  "dojo/text!./templates/Quota.html"],
function (declare, _Widget, templateString) {
  return declare(_Widget, {
    templateString: templateString,
    viewName: "Quota",

    updateQuota: function () {
      this.$quota.text(this.getUsedSpace() + "/" + this.getLimit())
    },
    getUsedSpace: function () {
      return this._bytesToMByte($.cookie("used_space"))
    },
    getLimit: function () {
      return this._bytesToMByte($.cookie("quota"))
    }
  })
})
