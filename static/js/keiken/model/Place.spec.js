"use strict"

define(["../model/Place",
  "../model/Collection"],
function (Place, Collection) {
  describe("Place", function () {
    it("should create empty place", function () {
      var place = new Place()
      expect(place.type).toBe("Place")
      expect(place.getTitle()).toBeUndefined()
    })
    it("should store photos", function () {
      var place = new Place({
        title: "new",
        id: 10,
        photos: [{
          title: "1",
          id: -1
        }, {
          title: "2",
          id: -1
        }]
      })
      var photos = place.getPhotos()
      expect(photos).toBeInstanceOf(Collection)
      expect(photos.size()).toBe(2)
      expect(place.getTitle()).toBe("new")
      expect(place.getId()).toBe(10)
    })
  })
})
