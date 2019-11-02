"use strict"

define(["dojo/_base/declare",
  "../model/Place",
  "../model/Collection"],
function (declare, Place, Collection) {
  describe("Place", function () {
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
