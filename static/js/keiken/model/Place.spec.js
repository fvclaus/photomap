"use strict"

define(["../model/Place",
  "../model/Collection"],
function (Place, Collection) {
  describe("Place", function () {
    var place

    beforeEach(function () {
      place = new Place({
        title: "Title",
        id: 10,
        photos: [{
          title: "1",
          id: -1
        }, {
          title: "2",
          id: -1
        }]
      })
    })
    it("should create empty place", function () {
      var place = new Place()
      expect(place.type).toBe("Place")
      expect(place.getTitle()).toBeUndefined()
    })
    it("should store photos", function () {
      var photos = place.getPhotos()
      expect(photos).toBeInstanceOf(Collection)
      expect(photos.size()).toBe(2)
      expect(place.getTitle()).toBe("Title")
      expect(place.getId()).toBe(10)
    })
    it("should ignore photos on _updateProperties", function () {
      place._updateProperties({
        title: "New title",
        photos: []
      })
      expect(place.getPhotos()).toBeInstanceOf(Collection)
      expect(place.getTitle()).toBe("New title")
    })

    it("should mark place as visited when all photos are visited", function () {
      place.photos.forEach(function (photo) {
        photo.visited = true
      })
      expect(place.isVisited()).toBeTruthy()
    })

    it("should mark place as not visited ", function () {
      place.photos.forEach(function (photo) {
        photo.visited = true
      })
      expect(place.isVisited()).toBeTruthy()
    })
  })
})
