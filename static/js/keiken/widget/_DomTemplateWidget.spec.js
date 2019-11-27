"use strict"

define(["./_DomTemplatedWidget",
  "dojo/_base/declare",
  "../tests/loadTestEnv!",
  "./tests/_DomTemplatedWidgetWithContainerNode",
  "./tests/_DomTemplatedWidgetWithContainerNodeWrapper",
  "./tests/_DomTemplatedWidgetWithoutContainerNode"],
function (_DomTemplatedWidget, declare, TestEnv) {
  describe("_DomTemplatedWidget", function () {
    var widget
    var $container

    afterEach(function () {
      widget.destroy()
    })

    it("should connect data-event of container nodes of immediate children", function () {
      var Widget = declare(_DomTemplatedWidget, {
        templateString: "<div>" +
          "<div data-dojo-type='keiken/widget/tests/_DomTemplatedWidgetWithContainerNodeWrapper' " +
               "data-widget-instance-name='wrapper'>" +
          "</div>" +
        "</div>",
        viewName: "Widget"
      })

      var t = new TestEnv().createWidget(null, Widget)

      widget = t.widget; $container = t.$container

      widget.startup()
      expect(widget.buttonNode).toBeUndefined()
      expect(widget.wrapper.buttonNode).toBeDefined()
      expect(widget.wrapper.isClicked).toBeFalsy()
      widget.wrapper.buttonNode.dispatchEvent(new Event("click"))
      expect(widget.wrapper.isClicked).toBeTruthy()
    })

    it("should not connect data-event of children", function () {
      var Widget = declare(_DomTemplatedWidget, {
        templateString: "<div>" +
        " <div data-dojo-attach-point='myNode' /> " +
        " <div data-dojo-type='keiken/widget/tests/_DomTemplatedWidgetWithoutContainerNode' " +
        "      data-widget-instance-name='instance'>" +
        " </div>" +
        "</div>",
        viewName: "Widget"
      })

      var t = new TestEnv().createWidget(null, Widget)

      widget = t.widget; $container = t.$container

      widget.startup()

      expect(widget.myNode).toBeDefined();

      ["rootNode", "childNode"].forEach(function (nodeName) {
        expect(widget[nodeName]).toBeUndefined()
        expect(widget.instance[nodeName]).toBeDefined()

        var clickFlag = "is" + nodeName[0].toUpperCase() + nodeName.slice(1) + "Clicked"
        expect(widget.instance[clickFlag]).toBeFalsy()
        widget.instance[nodeName].dispatchEvent(new Event("click"))
        expect(widget.instance[clickFlag]).toBeTruthy()
      })
    })
  })
})
