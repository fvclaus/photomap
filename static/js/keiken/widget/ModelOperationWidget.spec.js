"use strict"

define(["keiken/widget/ModelOperationWidget",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (ModelOperationWidget, Album, TestEnv) {
  describe("ModelOperationWidget", function () {
    var $container
    var widget = null

    beforeEach(function () {
      // TODO Fix this
      // $container = $("<span class='mp-controls-wrapper ui-corner-all mp-nodisplay' id='mp-controls'>")

      var t = new TestEnv().createWidget(null, ModelOperationWidget)

      widget = t.widget; $container = t.$container
      widget.startup()
    })

    afterEach(function () {
      widget.destroy()
    })

    it("should hide on startup", function () {
      expect($container).toBeHidden()
    })

    it("should be visible after show", function () {
      widget.show({
        modelInstance: new Album({
          title: "Album"
        }),
        offset: $("body").offset()
      })
      expect($container).toBeVisible()
    })

    it("should hide after mouseleave", function () {
      widget.show({
        modelInstance: new Album({
          title: "Album"
        }),
        offset: $("body").offset()
      })
      $container.trigger("mouseleave")
      expect($container).toBeHidden()
    })

    it("should hide after some time", function (done) {
      widget.show({
        modelInstance: new Album({
          title: "Album"
        }),
        offset: $("body").offset()
      })
      widget.hideAfterDelay(100)
      expect($container).toBeVisible()
      setTimeout(function () {
        expect($container).toBeHidden()
        done()
      }, 110)
    })
  })
})
