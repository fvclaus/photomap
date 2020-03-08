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
    },
    _bytesToMByte: function (bytesAsString) {
      var mByte = null
      try {
        mByte = (parseFloat(bytesAsString) / Math.pow(2, 20)).toFixed(1).toString()
      } catch (parseError) {
        mByte = "NaN"
        console.log("ClientState: Could not parse %s into MBytes.", bytesAsString)
      }
      return mByte
    }
  })
})
