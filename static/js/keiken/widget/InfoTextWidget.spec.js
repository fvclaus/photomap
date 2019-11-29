"use strict"

define(["./InfoTextWidget",
  "../tests/loadTestEnv!"],
function (InfoTextWidget, TestEnv) {
  describe("InfoTextWidget", function () {
    var $container
    var widget

    afterEach(function () {
      widget.destroy()
    })

    var itWithOpenInfoText = TestEnv.wrapJasmineIt(function (testFnWrapper) {
      return setTimeout(testFnWrapper, 200)
    }, function () {
      var t = new TestEnv().createWidget(null, InfoTextWidget)

      widget = t.widget; $container = t.$container

      widget.startup()
      widget.show({
        message: "Hello, World!",
        hideOnMouseover: true,
        fadingTime: 50
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
      }, 100)
    })

    itWithOpenInfoText("should hide on mouseover", function (done) {
      widget.domNode.dispatchEvent(new Event("mouseenter"))
      setTimeout(function () {
        expect($container).toBeHidden()
        done()
      }, 100)
    })
  })
})
