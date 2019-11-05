"use strict"

define(["../dialog/DeleteModelDialog",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (DeleteModelDialog, Album, $testBody) {
  describe("DeleteModelDialog", function () {
    var $container
    var widget
    beforeEach(function () {
      $container = $("<div id='mp-dialog'/>")
      $testBody
        .empty()
        .append($container)
      try {
        widget = new DeleteModelDialog()
      } catch (e) {
        console.error(e)
        throw e
      }
    })
    it("should render something", function () {
      widget.show(new Album({
        title: "Foo"
      }))
      expect(widget).toBeTruthy()
    })
  })
})
