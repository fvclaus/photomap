"use strict"

define(["./MapWidget",
  "../model/Album",
  "../model/Collection",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (MapWidget, Album, Collection, communicator, TestEnv) {
  describe("MapWidget", function () {
    var widget

    var album100 = new Album({
      title: "Album 100",
      lat: 52,
      lon: 7
    })
    var album200 = new Album({
      title: "Album 200",
      lat: 48,
      lon: 12
    })
    var albums

    beforeEach(function () {
      albums = new Collection([album100, album200], {
        modelType: "Album"
      })
      var t = new TestEnv().createWidget({
        isAdmin: true
      }, MapWidget)

      widget = t.widget
    })

    afterEach(function () {
      widget.destroy()
      communicator.clear()
    })

    it("should hide on startup", function () {
      spyOn(widget.infotext, "hide")
      widget.startup(albums)
      expect(widget.infotext.hide).toHaveBeenCalled()
    })

    var itWithCustomLoadedMap = function (triggerPublishFn) {
      return TestEnv.waitForPublishEvent("loaded:Map", triggerPublishFn)
    }

    var itWithLoadedMap = itWithCustomLoadedMap(function () {
      widget.startup(albums)
    })

    itWithLoadedMap("should change marker status", function () {
      spyOn(widget.markers[0], "displayAsSelected")
      widget.updateMarkerStatus(album100, "select")
      expect(widget.markers[0].displayAsSelected).toHaveBeenCalled()
    })

    var makePointerEvent = function (type, markerOrPosition) {
      var position = (markerOrPosition.constructor === Array)
        ? markerOrPosition
        : widget.getPositionInPixel(markerOrPosition)
      var viewPortPosition = $(".ol-viewport").get(0).getBoundingClientRect()
      var event = new Event(type)
      // Reverse engineer map.getEventPixel
      event.clientX = position[0] + viewPortPosition.left
      event.clientY = position[1] + viewPortPosition.top
      event.button = 0
      event.pointerId = 1
      return event
    }

    var triggerPointerDown = function (marker) {
      // Triggering with JQuery did not work
      $(".ol-viewport").get(0).dispatchEvent(makePointerEvent("pointerdown", marker))
    }

    var triggerPointerUp = function (marker) {
      // pointerup listener is registered on document
      document.dispatchEvent(makePointerEvent("pointerup", marker))
    }

    var triggerClick = function (marker) {
      triggerPointerDown(marker)
      triggerPointerUp(marker)
    }

    itWithLoadedMap("should publish click marker event on click", function (done) {
      spyOn(widget.markers[0], "displayAsSelected")
      communicator.subscribe("clicked:Marker", function (marker) {
        expect(marker.model).toBe(album100)
        expect(widget.markers[0].displayAsSelected).toHaveBeenCalled()
        done()
      })
      triggerClick(widget.markers[0])
    })

    itWithLoadedMap("should publish dblclick maker event on dblclick", function (done) {
      spyOn(widget.markers[0], "displayAsOpened")
      communicator.subscribe("dblClicked:Marker", function (marker) {
        expect(marker.model).toBe(album100)
        expect(widget.markers[0].displayAsOpened).toHaveBeenCalled()
        done()
      })

      triggerClick(widget.markers[0])
      triggerClick(widget.markers[0])
    })

    itWithLoadedMap("should publish clicked map event", function (done) {
      communicator.subscribe("clicked:Map", function (latLng) {
        expect(latLng.lat).toBeDefined()
        expect(latLng.lng).toBeDefined()
        done()
      })

      triggerClick([widget.$domNode.width() / 2, widget.$domNode.height() / 2])
    })

    itWithLoadedMap("should remove marker", function () {
      albums.delete(album100)
      expect(widget.markers.length).toBe(1)
      expect(widget.markers[0].model).toBe(album200)
    })

    var itWithUniqueAlbums = function () {
      var args = Array.prototype.slice.call(arguments)
      var itName = args.shift()
      var testFn = args.shift()
      return itWithCustomLoadedMap(function () {
        // eslint-disable-next-line no-useless-call
        widget.startup.apply(widget, args)
      })(itName, testFn)
    }

    itWithUniqueAlbums("should zoom out for only one marker", function () {
      expect(widget.map.getView().getZoom()).not.toBeGreaterThan(18)
    }, new Collection([album200], {
      modelType: "Album"
    }))

    itWithUniqueAlbums("should zoom out for fallback marker", function () {
      expect(widget.map.getView().getZoom()).not.toBeGreaterThan(18)
    }, new Collection([], {
      modelType: "Album"
    }), album100)

    itWithUniqueAlbums("should show world for zero markers", function () {
      expect(widget.map.getView().getZoom()).not.toBeGreaterThan(3)
    }, new Collection([], {
      modelType: "Album"
    }))
  })
})