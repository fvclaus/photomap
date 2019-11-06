define(["dojo/_base/declare",
  "dojo/_base/lang",
  "dojox/dtl/_base",
  "dojox/dtl/tag/loader"],
function (declare, lang, dd, ddtl) {
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
      if (parts.length !== 2) {
        throw new Error("'trans' statement takes one argument")
      }
      var key = parts[1]
      if (parts[1].charAt(0) === "\"" || parts[1].charAt(0) === "'") {
        key = parts[1].substring(1, parts[1].length - 1)
      }
      return new TransNode(key, parser.create_text_node())
    }
  })

  dd.register.tags("dojox.dtl.tag", {
    loader: ["trans"]
  })

  return {
    load: function (id, require, callback) {
      callback()
    }
  }
})
