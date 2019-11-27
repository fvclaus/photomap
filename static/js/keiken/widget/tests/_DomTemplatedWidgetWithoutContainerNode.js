define(["dojo/_base/declare",
  "../_DomTemplatedWidget"], function (declare, _DomTemplatedWidget) {
  return declare(_DomTemplatedWidget, {
    templateString:
    "<div data-dojo-attach-point='rootNode' " +
    "     data-dojo-attach-event='onclick: clickRoot' >" +
    " <div data-dojo-attach-point='childNode' " +
    "      data-dojo-attach-event='onclick: clickChild' > " +
    " </div> " +
    "</div>",
    viewName: "_DomTemplatedWidgetWithoutContainerNode",
    clickRoot: function () {
      this.isRootNodeClicked = true
    },
    clickChild: function () {
      this.isChildNodeClicked = true
    }
  })
})
