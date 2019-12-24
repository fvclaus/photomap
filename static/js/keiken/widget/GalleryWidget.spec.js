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
    })

    afterEach(function () {
      widget.destroy()
      communicator.clear()
    })

    var itWithOpenGallery = TestEnv.waitForPublishEvent("updated:Gallery", function () {
      widget.run(photos)
    })

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

    itWithOpenGallery("should display photos", function () {
      [0, 1].forEach(function (index) {
        expect($photos.eq(index).parent()).toHaveClass("mp-gallery-visited")
      });
      [2].forEach(function (index) {
        expect($photos.eq(index).parent()).not.toHaveClass("mp-gallery-visted")
      })
      expect($infoText).toBeHidden()
    })

    itWithOpenGallery("should load new photos", function (done) {
      widget.run(new Collection([photo300], {
        modelType: "Photo"
      }))
      communicator.subscribe("updated:Gallery", function () {
        expect($photos.eq(0)).toHaveAttr("src", photo300.thumb)
        done()
      })
      console.dir(communicator)
    })

    itWithOpenGallery("should hide verything on reset", function () {
      widget.reset();
      [0, 1, 2, 3, 4].forEach(function (index) {
        expect($photos.eq(index)).not.toHaveAttr("src")
        expect($infoText).toBeVisible()
      })
    })

    itWithOpenGallery("should publish mouseover on photo", function (done) {
      communicator.subscribe("mouseenter:GalleryPhoto", function (event) {
        expect(event.photo).toEqual(photo100)
        done()
      })
      $photos.eq(0).trigger("mouseenter")
    })

    itWithOpenGallery("should publish mouseleave on photo", function (done) {
      communicator.subscribe("mouseleave:GalleryPhoto", function (event) {
        expect(event.photo).toEqual(photo100)
        done()
      })
      $photos.eq(0).trigger("mouseleave")
    })

    itWithOpenGallery("should publish gallery insert on empty tile click", function (done) {
      communicator.subscribe("clicked:GalleryInsert", function () {
        done()
      })
      $photos.eq(4).trigger("click")
    })

    itWithOpenGallery("should mark photo as visited", function (done) {
      widget._isAdmin = false
      communicator.subscribe("clicked:GalleryPhoto", function (photo) {
        expect(photo).toEqual(photo100)
        done()
      })
      $photos.eq(0).trigger("click")
    })
  })
})
