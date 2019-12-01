define(["dojo/_base/declare",
  "../_Widget"], function (declare, _Widget) {
  return declare(_Widget, {
    templateString:
    "<div data-dojo-attach-point='rootNode' " +
    "     data-dojo-attach-event='onclick: clickRoot' >" +
    " <div data-dojo-attach-point='childNode' " +
    "      data-dojo-attach-event='onclick: clickChild' > " +
    " </div> " +
    "</div>",
    viewName: "_WidgetWithoutContainerNode",
    clickRoot: function () {
      this.isRootNodeClicked = true
    },
    clickChild: function () {
      this.isChildNodeClicked = true
    }
  })
})
