define(["dojo/_base/declare",
  "../_DomTemplatedWidget"], function (declare, _DomTemplatedWidget) {
  return declare(_DomTemplatedWidget, {
    templateString: "<div>" +
      " <div data-dojo-type='keiken/widget/tests/_DomTemplatedWidgetWithContainerNode'>" +
      "   <div class='mp-cloak'>" +
      "     <button data-dojo-attach-point='buttonNode' " +
      "             data-dojo-attach-event='onclick: click'>" +
      "       I am a button " +
      "     </button>" +
      "   </div>" +
      " </div>" +
      "</div>",
    viewName: "_DomTemplatedWidgetWithContainerNodeWrapper",
    click: function () {
      this.isClicked = true
    }
  })
})
