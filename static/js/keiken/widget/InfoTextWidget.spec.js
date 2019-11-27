"use strict"

define(["./InfoTextWidget",
  "./_DomTemplatedWidget",
  "dojo/_base/declare",
  "../tests/loadTestEnv!"],
function (InfoTextWidget, _DomTemplatedWidget, declare, TestEnv) {
  describe("InfoTextWidget", function () {
    var $container
    var widget

    afterEach(function () {
      widget.destroy()
    })

    var itWithOpenInfoText = TestEnv.wrapJasmineIt(function (testFnWrapper) {
      return setTimeout(testFnWrapper, 300)
    }, function () {
      var t = new TestEnv().createWidget(null, InfoTextWidget)

      widget = t.widget; $container = t.$container

      widget.startup()
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
      widget.domNode.dispatchEvent(new Event("mouseover"))
      setTimeout(function () {
        expect($container).toBeHidden()
        done()
      }, 300)
    })
  })
})
