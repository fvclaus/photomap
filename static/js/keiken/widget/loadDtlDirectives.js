define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojox/dtl/_base",
  "dojox/dtl/tag/loader",
  // Need to pre-load dtl tags, because dtl only supports synchronous loading.
  "dojox/dtl/tag/date",
  "dojox/dtl/tag/logic",
  "dojox/dtl/tag/loop",
  "dojox/dtl/tag/misc"], function (declare, lang, dd, ddtl) {
  var TransNode = declare(null, {
    constructor: function (translationKey, node) {
      this.translation = gettext(translationKey)
      this.contents = node
    },
    render: function (context, buffer) {
      this.contents.set(this.translation)
      return this.contents.render(context, buffer)
    }
  })

  lang.mixin(ddtl, {
    trans: function (parser, token) {
      var parts = token.contents.split()
      // Remove trans token
      parts.shift()
      // A string with spaces will be split on space
      var key = parts.join(" ")
      if (key.charAt(0) === "\"" || key.charAt(0) === "'") {
        key = key.substring(1, key.length - 1)
      }
      return new TransNode(key, parser.create_text_node())
    }
  })

  dd.register.tags("dojox.dtl.tag", {
    loader: ["trans", "children"]
  })

  return {
    // eslint-disable-next-line no-unused-vars
    load: function (id, require, callback) {
      callback()
    }
  }
})
