define(["dojo/_base/declare",
  "../_Widget"], function (declare, _Widget) {
  return declare(_Widget, {
    templateString: "<div data-testid='containerNode'> <div data-dojo-attach-point='containerNode'></div> </div>",
    viewName: "_WidgetWithContainerNode"
  })
})
