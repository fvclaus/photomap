"use strict"

define(["./_Widget",
  "dojo/_base/declare",
  "../tests/loadTestEnv!",
  "./tests/_WidgetWithCounter",
  "./tests/_WidgetWithContainerNode",
  "./tests/_WidgetWithContainerNodeWrapper",
  "./tests/_WidgetWithoutContainerNode"],
function (_Widget, declare, TestEnv, _DomTemplateWidgetWithCounter) {
  describe("_Widget", function () {
    var widget

    afterEach(function () {
      widget.destroy()
    })

    it("should connect data-event of container nodes of immediate children", function () {
      var Widget = declare(_Widget, {
        templateString: "<div data-testid='containerNodeWrapperWrapper'>" +
        " <div data-dojo-type='keiken/widget/tests/_WidgetWithContainerNodeWrapper' " +
        "      data-widget-instance-name='wrapper'></div>" +
        "</div>",
        viewName: "Widget"
      })

      var t = new TestEnv().createWidget(null, Widget)

      widget = t.widget

      widget.startup()
      expect(widget.hasChildren).toBeFalsy();
      // Check that all wrapper containers still exist and have not been accidentally overwritten
      ["containerNodeWrapper", "containerNodeWrapper", "containerNode"].forEach(function (containerId) {
        expect(widget.$domNode.find("[data-testid='" + containerId + "']")).toBeInDom()
      })
      // Make sure children are rendered in correct container
      expect(widget.$domNode.find("[data-testid='containerNode'] button")).toHaveLength(1)
      expect(widget.buttonNode).toBeUndefined()
      expect(widget.wrapper.hasChildren).toBeFalsy()
      expect(widget.wrapper.buttonNode).toBeDefined()
      expect(widget.wrapper.isClicked).toBeFalsy()
      widget.wrapper.buttonNode.dispatchEvent(new Event("click"))
      expect(widget.wrapper.isClicked).toBeTruthy()

      expect(widget.wrapper.container.buttonNode).toBeUndefined()
      expect(widget.wrapper.container.hasChildren).toBeTruthy()
    })

    it("should not connect data-event of children", function () {
      var Widget = declare(_Widget, {
        templateString: "<div>" +
        " <div data-dojo-attach-point='myNode' ></div> " +
        " <div data-dojo-type='keiken/widget/tests/_WidgetWithoutContainerNode' " +
        "      data-widget-instance-name='instance'>" +
        " </div>" +
        "</div>",
        viewName: "Widget"
      })

      var t = new TestEnv().createWidget(null, Widget)

      widget = t.widget

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

    it("should attach only once", function () {
      // Dijit's parser EventNode and _AttachMixin implement the same functionality
      var t = new TestEnv().createWidget(null, _DomTemplateWidgetWithCounter)

      widget = t.widget
      widget.startup()

      expect(widget.counter).toBe(0)
      widget.$counter.trigger("click")
      expect(widget.counter).toBe(1)
    })

    it("should not allow self closing tags in template string", function (done) {
      var Widget = declare(_Widget, {
        templateString: "<div>" +
        " <div/> " +
        " <div/>" +
        "</div>",
        viewName: "Widget"
      })

      try {
        new TestEnv().createWidget(null, Widget)
      } catch (e) {
        expect(e.message).toContain("self closing tag")
        done()
      }
    })
  })
  // TODO Add spec to test that html attributes are passed in as params
})
