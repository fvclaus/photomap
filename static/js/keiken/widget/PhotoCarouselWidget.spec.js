"use strict"

define(["./PhotoCarouselWidget",
  "../model/Photo",
  "../model/Collection",
  "../tests/loadTestEnv!"],
function (PhotoCarouselWidget, Photo, Collection, TestEnv) {
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
    var photos
    var $images

    beforeEach(function (done) {
      photos = new Collection([photo100, photo200, photo300], {
        modelType: "Photo"
      })

      var t = new TestEnv().createWidget({
        photosPerPage: 5,
        srcPropertyName: "photo",
        // This speeds up tests
        duration: 20
      }, PhotoCarouselWidget)

      widget = t.widget; $container = t.$container

      widget.options.onUpdate = function () {
        done()
      }
      widget.startup()
      widget.load(photos)
      widget.loadCurrentPage()
      $images = $container.find("img.mp-carousel-photo")
    })

    function getImageIds () {
      return $images
        .map(function () {
          return $(this).attr("data-keiken-id")
        })
        .get()
        .map(function (id) {
          return parseInt(id)
        })
    }

    afterEach(function () {
      widget.destroy()
    })

    it("should trigger events in correct order", function (done) {
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
      widget.loadCurrentPage()
    })

    it("should display all photos", function () {
      expect($images).toHaveLength(5)
      photos.forEach(function (photo, index) {
        var $image = $images.eq(index)
        expect($image).toHaveAttr("src", photo.photo)
        expect($image).toHaveAttr("data-keiken-id", photo.id.toString())
        expect($image).not.toHaveClass("mp-carousel-photo-empty")
      });
      [3, 4].forEach(function (index) {
        var $image = $images.eq(index)
        expect($image).not.toHaveAttr("src")
        expect($image).not.toHaveAttr("data-keiken-id")
        expect($image).toHaveClass("mp-carousel-photo-empty")
      })
    });

    ["left", "right"].forEach(function (direction) {
      it("should wrap around to the " + direction, function (done) {
        widget.options.onUpdate = function () {
          expect(getImageIds()).toEqual([100, 200, 300])
          done()
        }
        widget["navigate" + direction[0].toUpperCase() + direction.slice(1)].apply(widget)
      })
    })

    it("should not fail when images cannot be loaded", function (done) {
      var photo400 = new Photo({
        id: 400,
        photo: "/static/test/not-found"
      })
      photos.insert(photo400)
      widget.options.onUpdate = function () {
        expect(getImageIds()).toEqual([100, 200, 300, 400])
        done()
      }
      widget.navigateTo(photo400)
    })

    it("should load different photo collection on update", function (done) {
      var photos = new Collection([photo300, photo200], {
        modelType: "Photo"
      })
      widget.options.onUpdate = function () {
        expect(getImageIds()).toEqual([300, 200])
        done()
      }
      widget.update(photos)
    })

    it("should navigate to next page", function (done) {
      for (var i = 0; i < 5; i++) {
        photos.insert(new Photo({
          id: 101 + i,
          photo: photo100.photo
        }))
      }
      widget.options.onUpdate = function () {
        expect(getImageIds()).toEqual([103, 104, 105])
        done()
      }
      widget.navigateRight()
    })
  })
})
