"use strict"

define(["./SlideshowWidget",
  "../model/Photo",
  "../model/Collection",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (SlideshowWidget, Photo, Collection, communicator, TestEnv) {
  describe("SlideshowWidget", function () {
    var $container
    var widget

    var photo100 = new Photo({
      id: 100,
      photo: "/static/test/photo1.jpg"
    })
    var photo200 = new Photo({
      id: 200,
      photo: "/static/test/photo6.jpg"
    })
    var photo300 = new Photo({
      id: 300,
      photo: "/static/test/photo3.jpg"
    })
    var photos
    var $photo
    var $infoText

    beforeEach(function () {
      photos = new Collection([photo100, photo200, photo300], {
        modelType: "Photo"
      })

      var t = new TestEnv().createWidget(null, SlideshowWidget)

      widget = t.widget; $container = t.$container

      widget.startup()
      $photo = $container.find("img.mp-carousel-photo")
      $infoText = $container.find(".mp-infotext")
    })

    afterEach(function () {
      communicator.clear()
      widget.destroy()
    })

    var itWithGalleryRun = TestEnv.waitForPublishEvent("updated:Slideshow", function () {
      widget.load(photos)
      widget.run(photo200)
    })

    it("should display info text before run", function () {
      expect($infoText).toBeVisible()
    })

    itWithGalleryRun("should display photo", function () {
      expect($photo).toHaveAttr("src", photo200.photo)
      expect(widget.$photoNumber.text()).toBe("Photo 2/3")
    });

    [{
      navigateEl: "$navLeft",
      name: "should navigate left",
      expectedPhoto: photo100,
      expectedNumber: "Photo 1/3"
    }, {
      navigateEl: "$navRight",
      name: "should navigate right",
      expectedPhoto: photo300,
      expectedNumber: "Photo 3/3"
    }].forEach(function (testDefinition) {
      itWithGalleryRun(testDefinition.name, function (done) {
        widget[testDefinition.navigateEl].trigger("click")
        communicator.subscribeOnce("updated:Slideshow", function () {
          expect($photo).toHaveAttr("src", testDefinition.expectedPhoto.photo)
          expect(widget.$photoNumber.text()).toBe(testDefinition.expectedNumber)
          done()
        })
      })
    })

    itWithGalleryRun("should update photo number when new photo is inserted", function () {
      photos.insert(new Photo({
        id: 400
      }))
      expect(widget.$photoNumber.text()).toBe("Photo 2/4")
    })

    itWithGalleryRun("should reload if current photo is deleted", function (done) {
      photos.delete(photo200)
      communicator.subscribeOnce("updated:Slideshow", function () {
        expect($photo).toHaveAttr("src", photo300.photo)
        expect(widget.$photoNumber.text()).toBe("Photo 2/2")
        done()
      })
    })

    itWithGalleryRun("should hide photo number when last photo is deleted", function (done) {
      photos.models = [photo200]
      photos.delete(photo200)
      communicator.subscribeOnce("updated:Slideshow", function () {
        expect($photo).not.toHaveAttr("src")
        expect(widget.$photoNumber.text()).toBe("")
        expect($infoText).toBeVisible()
        done()
      })
    })

    itWithGalleryRun("should show info text after reset", function () {
      widget.reset()
      expect($infoText).toBeVisible()
    })
  })
})
