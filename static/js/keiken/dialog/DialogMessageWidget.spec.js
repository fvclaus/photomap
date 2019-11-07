"use strict"

define(["./DialogMessageWidget",
  "../util/ClientState",
  "../tests/loadTestEnv!"],
function (DialogMessageWidget, clientState, $testBody) {
  describe("DialogMessageWidget", function () {
    var $container
    var widget = null

    beforeEach(function () {
      $container = $("<div/>")
      $testBody
        .empty()
        .append($container)

      widget = new DialogMessageWidget(null, $container.get(0))
      widget.startup()
    })

    afterEach(function () {
      widget.destroy()
      clientState.setDialogAutoClose(false)
    })

    it("should hide on startup", function () {
      expect(widget.$container).toBeHidden()
    })

    it("should show success", function () {
      widget.showSuccess()
      expect(widget.$success).toBeVisible()
      expect(widget.$failure).toBeHidden()
    })

    it("should show failure", function () {
      widget.showFailure("Something went wrong")
      expect(widget.$failure).toBeVisible()
      expect(widget.$success).toBeHidden()
    })

    it("should update autoclose", function () {
      widget.showSuccess()
      widget.$autoCloseInput.trigger("click")
      expect(clientState.getDialogAutoClose()).toBeTruthy()
    })
  })
})
