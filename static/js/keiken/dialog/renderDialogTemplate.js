define(["dijit/_TemplatedMixin",
  "dojox/dtl/Context",
  "dojox/dtl/_base",
  "dojox/dtl/render/dom",
  "../widget/loadDtlDirectives!"],
function (_TemplatedMixin, Context, dd, ddrd) {
  return function (templateString, context) {
    var domNode = document.createElement("div")
    var template = new dd.DomTemplate(_TemplatedMixin.getCachedTemplate(templateString, true))
    var renderer = new ddrd.Render(domNode, template)
    renderer.domNode = domNode
    renderer.render(new Context($.extend({}, context, {})))
    return renderer.domNode
  }
})
