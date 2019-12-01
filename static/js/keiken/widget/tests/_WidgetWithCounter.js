define(["dojo/_base/declare",
  "../_Widget"], function (declare, _Widget) {
  return declare(_Widget, {
    templateString: "<div> " +
    " <span " +
    "   data-dojo-attach-event='onclick: incrementCounter' " +
    "   data-dojo-attach-point='counterNode'> Click Me!</span> " +
    "</div>",
    viewName: "_WidgetWithCounter",
    counter: 0,
    incrementCounter: function () {
      this.counter++
    }
  })
})
