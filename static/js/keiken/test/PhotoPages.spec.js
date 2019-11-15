"use strict"

define(["../util/PhotoPages",
  "../model/Collection",
  "../model/Photo"],
function (PhotoPages, Collection, Photo) {
  describe("PhotoPages", function () {
    var photo100 = new Photo({
      id: 100,
      title: "Photo 100",
      order: 100
    })
    var photo200 = new Photo({
      id: 200,
      title: "Photo 200",
      order: 200
    })
    var photo300 = new Photo({
      id: 300,
      title: "Photo 300",
      order: 300
    })
    var photos

    beforeEach(function () {
      photos = new Collection([photo100, photo200, photo300], {
        modelType: "Photo"
      })
    })

    it("should fill with null values", function () {
      var pages = new PhotoPages(photos, 5)
      expect(pages.getCurrentPageIndex()).toBe(0)
      var page = pages.navigateTo("first")
      expect(pages.getCurrentPageIndex(0)).toBe(0)
      expect(page.length).toBe(5)
      expect(page[0]).toBe(photo100)
      expect(page[1]).toBe(photo200)
      expect(page[2]).toBe(photo300)
      expect(page[3]).toBeNull()
      expect(page[4]).toBeNull()
    })

    it("should get last page", function () {
      var pages = new PhotoPages(photos, 1)
      var page = pages.navigateTo("last")
      expect(page.length).toBe(1)
      expect(page[0]).toBe(photo300)
      expect(pages.getCurrentPageIndex()).toBe(2)
    })

    it("should wrap around", function () {
      var pages = new PhotoPages(photos, 1)
      pages.navigateTo("last")
      pages.navigateTo("next")
      expect(pages.getCurrentPageIndex()).toBe(0)
    })

    it("should wrap around in the other direction", function () {
      var pages = new PhotoPages(photos, 1)
      pages.navigateTo("previous")
      expect(pages.getCurrentPageIndex()).toBe(2)
    });

    [{
      pageSize: 2,
      photo: photo300,
      expectedPageIndex: 1

    }, {
      pageSize: 1,
      photo: photo100,
      expectedPageIndex: 0
    }, {
      pageSize: 1,
      photo: photo300,
      expectedPageIndex: 2
    }].forEach(function (testDefinition) {
      it("should navigate to page " + (testDefinition.expectedPageIndex + 1) + " (page size = " + testDefinition.pageSize + ")", function () {
        var pages = new PhotoPages(photos, testDefinition.pageSize)
        pages.navigateTo(testDefinition.photo)
        expect(pages.getCurrentPageIndex()).toBe(testDefinition.expectedPageIndex)
      })
    })

    it("should be on last page", function () {
      var pages = new PhotoPages(photos, 100)
      expect(pages.isLastPage()).toBeTruthy()
    })

    it("should be on first page", function () {
      var pages = new PhotoPages(photos, 100)
      expect(pages.isFirstPage()).toBeTruthy()
    })

    it("should have three pages", function () {
      var pages = new PhotoPages(photos, 1)
      expect(pages.getNPages()).toBe(3)
    })

    it("should correct page index after deletion", function () {
      var pages = new PhotoPages(photos, 1)
      pages.navigateTo("last")
      photos.delete(photo300)
      pages.correctCurrentPageIndexIfNecessary()
      expect(pages.getCurrentPageIndex()).toBe(1)
    })
  })
})
