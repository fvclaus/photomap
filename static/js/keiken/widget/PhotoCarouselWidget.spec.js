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
    var $photos

    beforeEach(function () {
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

      widget.startup()
      $photos = $container.find("img.mp-carousel-photo")
    })

    function getImageIds () {
      return $photos
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

    var itWithPhotos = TestEnv.wrapJasmineIt(function (testFnWrapper) {
      widget.options.onUpdate = testFnWrapper
    }, function () {
      widget.load(photos)
      widget.loadCurrentPage()
    });

    [{
      name: "should trigger events in correct order on page with photos",
      photos: new Collection([photo100], {
        modelType: "Photo"
      }),
      expectedAfterLoadPhotos: [0]
    },
    {
      name: "should trigger events in correct order on empty page",
      photos: new Collection([], {
        modelType: "Photo"
      }),
      expectedAfterLoadPhotos: []
    }].forEach(function (testDefinition) {
      var checkPhotos = function (photos, expectPhotoIndexes) {
        expect(photos).toEqual(expectPhotoIndexes
          .map(function (index) {
            return testDefinition.photos.getByIndex(index)
          })
          .map(function (photo) {
            return photo === undefined ? null : photo
          }))
      }
      it(testDefinition.name, function (done) {
        var triggeredBeforeLoad = false
        widget.options.beforeLoad = function ($photos) {
          expect($photos).toBeInstanceOf($)
          triggeredBeforeLoad = true
        }
        var triggeredAfterLoad = false
        widget.options.afterLoad = function ($photos, photos) {
          expect($photos).toBeInstanceOf($)
          checkPhotos(photos, testDefinition.expectedAfterLoadPhotos)
          expect(triggeredBeforeLoad).toBeTruthy()
          triggeredAfterLoad = true
        }
        widget.options.onUpdate = function ($photos, photos) {
          expect($photos).toBeInstanceOf($)
          checkPhotos(photos, [0, 1, 2, 3, 4])
          expect(triggeredAfterLoad).toBeTruthy()
          done()
        }
        widget.load(testDefinition.photos)
        widget.loadCurrentPage()
      })
    })

    itWithPhotos("should display all photos", function () {
      expect($photos).toHaveLength(5)
      photos.forEach(function (photo, index) {
        var $photo = $photos.eq(index)
        expect($photo).toHaveAttr("src", photo.photo)
        expect($photo).toHaveAttr("data-keiken-id", photo.id.toString())
        expect($photo).not.toHaveClass("mp-carousel-photo-empty")
      });
      [3, 4].forEach(function (index) {
        var $photo = $photos.eq(index)
        expect($photo).not.toHaveAttr("src")
        expect($photo).not.toHaveAttr("data-keiken-id")
        expect($photo).toHaveClass("mp-carousel-photo-empty")
      })
    });

    ["left", "right"].forEach(function (direction) {
      itWithPhotos("should wrap around to the " + direction, function (done) {
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
      widget.options.onUpdate = function () {
        expect(getImageIds()).toEqual([400])
        done()
      }
      widget.load(new Collection([photo400], {
        modelType: "Photo"
      }))
      widget.loadCurrentPage()
    })

    itWithPhotos("should load different photo collection on update", function (done) {
      var photos = new Collection([photo300, photo200], {
        modelType: "Photo"
      })
      widget.options.onUpdate = function () {
        expect(getImageIds()).toEqual([300, 200])
        done()
      }
      widget.update(photos)
    })

    itWithPhotos("should navigate to next page", function (done) {
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
    });

    ["click", "mouseenter", "mouseleave"].forEach(function (eventType) {
      var eventTriggerName = "onPhoto" + eventType[0].toUpperCase() + eventType.slice(1)
      itWithPhotos("should trigger " + eventTriggerName, function (done) {
        widget.options[eventTriggerName] = function ($photo, photo) {
          expect($photo).toBeInstanceOf($)
          expect(photo).toEqual(photo100)
          done()
        }
        $photos.eq(0).trigger(eventType)
      })
    })
  })
})
