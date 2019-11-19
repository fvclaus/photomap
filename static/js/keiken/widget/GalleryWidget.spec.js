"use strict"

define(["./GalleryWidget",
  "../model/Photo",
  "../model/Collection",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (GalleryWidget, Photo, Collection, communicator, TestEnv) {
  describe("GalleryWidget", function () {
    var $container
    var widget

    var photo100 = new Photo({
      id: 100,
      thumb: "/static/test/photo1.jpg",
      visited: true
    })
    var photo200 = new Photo({
      id: 200,
      thumb: "/static/test/photo2.jpg",
      visited: true
    })
    var photo300 = new Photo({
      id: 300,
      thumb: "/static/test/photo3.jpg"
    })
    var photos
    var $photos

    beforeEach(function () {
      photos = new Collection([photo100, photo200, photo300], {
        modelType: "Photo"
      })

      var t = new TestEnv().createWidget({
        adminMode: true
      }, GalleryWidget)

      widget = t.widget; $container = t.$container

      widget.startup()
      $photos = $container.find("img.mp-carousel-photo")
    })

    afterEach(function () {
      communicator.clear()
    })

    it("should display photos", function (done) {
      widget.run(photos)
      communicator.subscribe("updated:Gallery", function () {
        [0, 1].forEach(function (index) {
          expect($photos.eq(index)).toHaveClass("mp-gallery-photo-visited")
        });
        [2, 3, 4].forEach(function (index) {
          expect($photos.eq(index)).not.toHaveClass("mp-gallery-photo-visted")
        })
        done()
      })
    })
  })
})
