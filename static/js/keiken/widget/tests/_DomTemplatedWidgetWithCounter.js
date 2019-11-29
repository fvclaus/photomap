define(["dojo/_base/declare",
  "../_DomTemplatedWidget"], function (declare, _DomTemplatedWidget) {
  return declare(_DomTemplatedWidget, {
    templateString: "<div> " +
    " <span " +
    "   data-dojo-attach-event='onclick: incrementCounter' " +
    "   data-dojo-attach-point='counterNode'> Click Me!</span> " +
    "</div>",
    viewName: "_DomTemplatedWidgetWithCounter",
    counter: 0,
    incrementCounter: function () {
      this.counter++
    }
  })
})
