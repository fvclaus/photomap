define(["dojo/_base/declare",
  "../_DomTemplatedWidget"], function (declare, _DomTemplatedWidget) {
  return declare(_DomTemplatedWidget, {
    templateString: "<div> <div data-dojo-attach-point='containerNode'></div> </div>",
    viewName: "_DomTemplatedWidgetWithContainerNode"
  })
})
