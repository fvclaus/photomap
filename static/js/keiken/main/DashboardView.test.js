"use strict"

define(["./DashboardView",
  "../model/Photo",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (DashboardView, Photo, communicator, TestEnv) {
  describe("DetailDescriptionWidget", function () {
    var widget

    afterEach(function () {
      widget.destroy()
      communicator.clear()
    })

    var itWithLongDescription = TestEnv.wrapJasmineItSyncSetup(function () {
      var t = new TestEnv().createWidget({
        abbreviateDescription: false
      }, DashboardView)

      widget = t.widget

      widget.startup()
    })
  })
})
