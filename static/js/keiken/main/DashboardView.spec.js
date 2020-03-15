"use strict"

define(["./DashboardView",
  "../model/Album",
  "../model/Collection",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (DashboardView, Album, Collection, communicator, TestEnv) {
  describe("DashboardView", function () {
    var widget

    // afterEach(function () {
    //   widget.destroy()
    //   communicator.clear()
    // })

    var itWithAlbums = TestEnv.wrapJasmineItSyncSetup(function () {
      var t = new TestEnv().createWidget({
        isAdmin: true,
        markerModels: new Collection([
          new Album({
            title: "Album 1",
            id: 1,
            lat: 90,
            lng: 90
          }),
          new Album({
            title: "Album 2",
            id: 2,
            lat: 90,
            lng: 90
          })])
      }, DashboardView)

      widget = t.widget

      widget.startup()
    })

    itWithAlbums("should be defined", function () {
      expect(widget).toBeDefined()
    })
  })
})
