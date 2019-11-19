"use strict"

define(["./DialogMessageWidget",
  "../util/ClientState",
  "../tests/loadTestEnv!"],
function (DialogMessageWidget, clientState, TestEnv) {
  describe("DialogMessageWidget", function () {
    var $container
    var widget

    beforeEach(function () {
      var t = new TestEnv().createWidget(null, DialogMessageWidget)
      widget = t.widget; $container = t.$container
      widget.startup()
    })

    afterEach(function () {
      widget.destroy()
      clientState.setDialogAutoClose(false)
    })

    it("should hide on startup", function () {
      expect($container).toBeHidden()
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
