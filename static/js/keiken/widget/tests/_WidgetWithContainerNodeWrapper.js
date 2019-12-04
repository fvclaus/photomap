define(["dojo/_base/declare",
  "../_Widget"], function (declare, _Widget) {
  return declare(_Widget, {
    templateString: "<div data-testid='containerNodeWrapper'>" +
      " <div data-dojo-type='keiken/widget/tests/_WidgetWithContainerNode' " +
      "      data-widget-instance-name='container'>" +
      "   <div class='mp-cloak'>" +
      "     <button data-dojo-attach-point='buttonNode' " +
      "             data-dojo-attach-event='onclick: click'>" +
      "       I am a button " +
      "     </button>" +
      "   </div>" +
      " </div>" +
      "</div>",
    viewName: "_WidgetWithContainerNodeWrapper",
    click: function () {
      this.isClicked = true
    }
  })
})
