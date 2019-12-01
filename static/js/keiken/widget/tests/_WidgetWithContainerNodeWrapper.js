define(["dojo/_base/declare",
  "../_Widget"], function (declare, _Widget) {
  return declare(_Widget, {
    templateString: "<div>" +
      " <div data-dojo-type='keiken/widget/tests/_WidgetWithContainerNode'>" +
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
