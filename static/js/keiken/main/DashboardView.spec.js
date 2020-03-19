"use strict"

define(["./DashboardView",
  "../model/Album",
  "../model/Collection",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (DashboardView, Album, Collection, communicator, TestEnv) {
  describe("DashboardView", function () {
    var widget
    var albums

    afterEach(function () {
      widget.destroy()
      communicator.clear()
    })

    var itWithMultipleAlbums = TestEnv.wrapJasmineItSyncSetup(function () {
      albums = new Collection([
        new Album({
          title: "Album 1",
          id: 1,
          lat: 52,
          lon: 7,
          secret: "secret"
        }),
        new Album({
          title: "Album 2",
          id: 2,
          lat: 48,
          lon: 12
        })])
      var t = new TestEnv().createWidget({
        isAdmin: true,
        markerModels: albums
      }, DashboardView)

      widget = t.widget

      widget.startup()
    })

    itWithMultipleAlbums("should be defined", function () {
      expect(widget).toBeDefined()
    })

    itWithMultipleAlbums("should display description when marker is clicked", function () {
      spyOn(widget.description, "show").and.callThrough()
      communicator.publish("clicked:Marker", albums.get(0))
      expect(widget.description.show).toHaveBeenCalledWith(albums.get(0))
    })
    itWithMultipleAlbums("should open album on dblclick", function () {
      spyOn(widget, "goToPath")
      communicator.publish("dblClicked:Marker", albums.get(0))
      expect(widget.goToPath).toHaveBeenCalledWith("/album/1/view/secret/")
    })
    itWithMultipleAlbums("should show controls on mouseover", function () {
      spyOn(widget.controls, "show")
      var albumPositionDescriptor = {
        model: albums.get(0),
        offset: 200,
        dimensions: {
          width: 18,
          height: 18
        }
      }
      communicator.publish("mouseover:Marker", albumPositionDescriptor)
      expect(widget.controls.show).toHaveBeenCalledWith(albumPositionDescriptor)
    })
    itWithMultipleAlbums("should hide controls on mouseout", function () {
      spyOn(widget.controls, "hideAfterDelay")
      communicator.publish("mouseout:Marker")
      expect(widget.controls.hideAfterDelay).toHaveBeenCalled()
    })

    var album

    var itWithSingleAlbum = TestEnv.wrapJasmineItSyncSetup(function (options) {
      album = new Album({
        title: "Album 1",
        id: 1,
        lat: 52,
        lon: 7,
        secret: "secret",
        places: [{
          id: 2,
          title: "Place",
          lat: 53,
          lon: 7,
          photos: [{
            id: 3
          }]
        }]
      })

      var t = new TestEnv().createWidget(Object.assign({}, {
        isAdmin: true,
        markerModels: album
      }, options), DashboardView)

      widget = t.widget

      widget.startup()
    })

    itWithSingleAlbum("should open place on dblClick", function () {
      spyOn(widget.description, "show")
      spyOn(widget.gallery, "run")
      spyOn(widget.slideshow, "load")
      spyOn(widget.fullscreen, "load")
      var place = album.places.get(0)
      communicator.publish("dblClicked:Marker", place)
      expect(widget.description.show).toHaveBeenCalledWith(place)
      expect(widget.gallery.run).toHaveBeenCalledWith(place.photos)
      expect(widget.slideshow.load).toHaveBeenCalledWith(place.photos)
      expect(widget.fullscreen.load).toHaveBeenCalledWith(place.photos)
    })

    itWithSingleAlbum("should not have controls in user mode", function () {
      expect(widget.controls).toBeUndefined()
    }, {
      isAdmin: false
    })
  })
})
