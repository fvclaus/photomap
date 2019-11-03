"use strict"

define(["keiken/widget/ModelOperationWidget",
  "../model/Album",
  "./JQueryMatchers",
  "./TestFixture",
  "dojo/domReady!"],
function (ModelOperationWidget, Album, JQueryMatchers, TestFixture) {
  var slideshow = null
  var $testBody = new TestFixture().getTestBody()
  var $container
  var photos = null
  var photoCollection = null
  // var assertTooltipPresence = function (present) {
  //   if (present) {
  //     QUnit.ok$visible($(".mp-infotext"))
  //   } else {
  //     QUnit.ok$hidden($(".mp-infotext"))
  //   }
  // }
  var modelOperation = null

  describe("ModelOperation", function () {
    beforeEach(function () {
      $container = $("<span class='mp-controls-wrapper ui-corner-all mp-nodisplay' id='mp-controls'>")
      jasmine.addMatchers(JQueryMatchers)
      $testBody
        .append($container)

      modelOperation = new ModelOperationWidget(null, $container.get(0))
      modelOperation.startup()
    })

    afterAll(function () {
      $testBody.empty()
    })

    afterEach(function () {
      modelOperation.destroy()
    })

    it("should hide on startup", function () {
      expect(modelOperation.$container).toBeHidden()
    })

    it("should be visible after show", function () {
      modelOperation.show({
        modelInstance: new Album({
          title: "Album"
        }),
        offset: $("body").offset()
      })
      expect(modelOperation.$container).toBeVisible()
    })

    it("should hide after mouseleave", function () {
      modelOperation.show({
        modelInstance: new Album({
          title: "Album"
        }),
        offset: $("body").offset()
      })
      modelOperation.$container.trigger("mouseleave")
      expect(modelOperation.$container).toBeHidden()
    })

    it("should hide after some time", function (done) {
      modelOperation.show({
        modelInstance: new Album({
          title: "Album"
        }),
        offset: $("body").offset()
      })
      modelOperation.hideAfterDelay(100)
      expect(modelOperation.$container).toBeVisible()
      setTimeout(function () {
        expect(modelOperation.$container).toBeHidden()
        done()
      }, 110)
    })
  })
})
