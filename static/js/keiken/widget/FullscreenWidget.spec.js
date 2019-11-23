"use strict"

define(["./FullscreenWidget",
  "../model/Photo",
  "../model/Collection",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (FullscreenWidget, Photo, Collection, communicator, TestEnv) {
  describe("FullscreenWidget", function () {
    var $container
    var widget

    var photo100 = new Photo({
      id: 100,
      photo: "/static/test/photo1.jpg",
      title: "Photo 100"
    })
    var photo200 = new Photo({
      id: 200,
      photo: "/static/test/photo2.jpg",
      title: "Photo 200"
    })
    var photo300 = new Photo({
      id: 300,
      photo: "/static/test/photo3.jpg",
      title: "Photo 300"
    })
    var $photo

    beforeEach(function () {
      var t = new TestEnv().createWidget(null, FullscreenWidget)

      widget = t.widget; $container = t.$container

      widget.startup()
      $photo = $container.find("img.mp-carousel-photo")
      widget.setActive(true)
    })

    afterEach(function () {
      communicator.clear()
      widget.destroy()
    })

    var itWithOpenFullscreen = TestEnv.wrapJasmineIt("updated:Fullscreen", function () {
      widget.load(new Collection([photo100, photo200, photo300], {
        modelType: "Photo"
      }))
      widget.show(photo200)
    })

    itWithOpenFullscreen("should display photo", function () {
      expect($photo).toHaveAttr("src", photo200.photo)
      expect(widget.$title.text()).toBe(photo200.title)
    })

    itWithOpenFullscreen("should close and hide fullscreen", function () {
      widget.$close.trigger("click")
      expect(widget.$container).toBeHidden()
    });

    [{
      navigateEl: "$navLeft",
      name: "should navigate left",
      expectedPhoto: photo100
    }, {
      navigateEl: "$navRight",
      name: "should navigate right",
      expectedPhoto: photo300
    }].forEach(function (testDefinition) {
      itWithOpenFullscreen(testDefinition.name, function (done) {
        widget[testDefinition.navigateEl].trigger("click")
        communicator.subscribe("updated:Fullscreen", function () {
          expect($photo).toHaveAttr("src", testDefinition.expectedPhoto.photo)
          done()
        })
      })
    })
  })
})
