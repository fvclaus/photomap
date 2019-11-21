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
    var $infoText

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
      $infoText = $container.find(".mp-infotext")
      widget.setActive(true)
    })

    afterEach(function () {
      communicator.clear()
    })

    var itWithPhotos = function (name, testFn) {
      it(name, function (done) {
        widget.run(photos)
        communicator.subscribeOnce("updated:Gallery", function () {
          switch (testFn.length) {
            case 0:
              try {
                testFn()
              } catch (e) {
                console.error(e)
              } finally {
                done()
              }
              break
            case 1:
              testFn(done)
              break
            default:
              console.error(name, "testFn has too many arguments")
          }
        })
      })
    }

    it("should display info text when place not loaded", function () {
      expect($infoText).toBeVisible()
    })

    it("should display info text when place has no photos", function (done) {
      widget.run(new Collection([], {
        modelType: "Photo"
      }))
      communicator.subscribe("updated:Gallery", function () {
        expect($infoText).toBeVisible()
        done()
      })
    });

    [{
      name: "should navigate left",
      navigateEl: "$navLeft",
      expectedPhotos: [photo100]
    },
    {
      name: "should navigate right",
      navigateEl: "$navRight",
      expectedPhotos: [photo300]
    }].forEach(function (testDefinition) {
      var generatePhoto = function (index) {
        switch (index) {
          case 0:
            return photo100
          case 5:
            return photo200
          case 10:
            return photo300
          default:
            return new Photo({
              id: index,
              thumb: photo100.thumb
            })
        }
      }
      it(testDefinition.name, function (done) {
        var photos = []
        for (var i = 0; i < 11; i++) {
          photos.push(generatePhoto(i))
        }
        widget.run(new Collection(photos, {
          modelType: "Photo"
        }), photo200)
        var hasNavigated = false
        communicator.subscribe("updated:Gallery", function () {
          if (!hasNavigated) {
            widget[testDefinition.navigateEl].trigger("click")
            hasNavigated = true
          } else {
            testDefinition.expectedPhotos.forEach(function (expectedPhoto, index) {
              expect($photos.eq(index)).toHaveAttr("src", expectedPhoto.thumb)
            })
            done()
          }
        })
      })
    })

    itWithPhotos("should display photos", function () {
      [0, 1].forEach(function (index) {
        expect($photos.eq(index)).toHaveClass("mp-gallery-photo-visited")
      });
      [2].forEach(function (index) {
        expect($photos.eq(index)).not.toHaveClass("mp-gallery-photo-visted")
      })
      expect($infoText).toBeHidden()
    })

    itWithPhotos("should load new photos", function (done) {
      widget.run(new Collection([photo300], {
        modelType: "Photo"
      }))
      communicator.subscribe("updated:Gallery", function () {
        expect($photos.eq(0)).toHaveAttr("src", photo300.thumb)
        done()
      })
    })

    itWithPhotos("should hide verything on reset", function () {
      widget.reset();
      [0, 1, 2, 3, 4].forEach(function (index) {
        expect($photos.eq(index)).not.toHaveAttr("src")
        expect($infoText).toBeVisible()
      })
    })
  })
})
