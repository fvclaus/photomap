"use strict"

define(["./MapWidget",
  "../model/Album",
  "../model/Collection",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (MapWidget, Album, Collection, communicator, TestEnv) {
  describe("MapWidget", function () {
    var widget
    var $domNode

    var album100 = new Album({
      title: "Album 100",
      lat: 90,
      lon: 80
    })
    var album200 = new Album({
      title: "Album 200",
      lat: 100,
      lon: 70
    })
    var albums = new Collection([album100, album200], {
      modelType: "Album"
    })

    beforeEach(function () {
      var t = new TestEnv().createWidget({
        includeShareOperation: true
      }, MapWidget)

      widget = t.widget; $domNode = widget.$domNode
      widget.startup(albums)
    })

    // afterEach(function () {
    //   widget.destroy()
    // })

    it("should hide on startup", function () {
      spyOn(widget.infotext, "hide")
      widget.startup(albums)
      expect(widget.infotext.hide).toHaveBeenCalled()
    })
  })
})
