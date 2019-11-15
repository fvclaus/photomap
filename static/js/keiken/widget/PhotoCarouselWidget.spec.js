"use strict"

define(["./PhotoCarouselWidget",
  "../model/Photo",
  "../model/Collection",
  "node_modules/jasmine-jquery-matchers/dist/jasmine-jquery-matchers",
  "../tests/loadTestEnv!"],
function (PhotoCarouselWidget, Photo, Collection, jasmineJqueryMatchers, $testBody) {
  describe("PhotoCarouselWidget", function () {
    var $container
    var widget

    var photo100 = new Photo({
      id: 100,
      photo: "/static/test/photo1.jpg"
    })
    var photo200 = new Photo({
      id: 200,
      photo: "/static/test/photo2.jpg"
    })
    var photo300 = new Photo({
      id: 300,
      photo: "/static/test/photo3.jpg"
    })

    beforeEach(function () {
      jasmine.addMatchers(jasmineJqueryMatchers)
      $testBody
        .empty()
        .append($("<div id='photoCarouselWidget' />"))

      var photos = new Collection([photo100, photo200, photo300], {
        modelType: "Photo"
      })

      try {
        widget = new PhotoCarouselWidget({
          photosPerPage: 5,
          photos: photos,
          srcPropertyName: "photo"
        }, document.getElementById("photoCarouselWidget"))
      } catch (e) {
        console.error(e)
      }
      $container = $("#photoCarouselWidget")
    })

    afterEach(function () {
      widget.destroy()
    })

    it("should display 5 photos", function (done) {
      var triggeredBeforeLoad = false
      widget.options.beforeLoad = function () {
        triggeredBeforeLoad = true
      }
      var triggeredAfterLoad = false
      widget.options.afterLoad = function () {
        expect(triggeredBeforeLoad).toBeTruthy()
        triggeredAfterLoad = true
      }
      widget.options.onUpdate = function () {
        expect(triggeredAfterLoad).toBeTruthy()
        done()
      }
      widget.startup()
      expect($container.find("img.mp-carousel-photo")).toHaveLength(5)
    })
  })
})
