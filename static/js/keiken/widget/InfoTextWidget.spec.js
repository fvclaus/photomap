"use strict"

define(["./InfoTextWidget",
  "../tests/loadTestEnv!"],
function (InfoTextWidget, TestEnv) {
  describe("InfoTextWidget", function () {
    var $container
    var widget

    beforeEach(function () {
      var t = new TestEnv().createWidget({
      }, InfoTextWidget)

      widget = t.widget; $container = t.$container

      widget.startup()
    })

    afterEach(function () {
      widget.destroy()
    })

    var itWithOpenInfoText = TestEnv.wrapJasmineIt(function (testFnWrapper) {
      return setTimeout(testFnWrapper, 300)
    }, function () {
      widget.show({
        message: "Hello, World!",
        hideOnMouseover: true
      })
    })

    itWithOpenInfoText("should show message on start", function () {
      expect(widget.$message.text()).toBe("Hello, World!")
      expect($container).toBeVisible()
    })

    itWithOpenInfoText("should hide", function (done) {
      widget.hide()
      setTimeout(function () {
        expect($container).toBeHidden()
        done()
      }, 300)
    })

    itWithOpenInfoText("should hide on mouseover", function (done) {
      widget.$message.trigger("mouseover")
      setTimeout(function () {
        expect($container).toBeHidden()
        done()
      }, 300)
    })
  })
})
