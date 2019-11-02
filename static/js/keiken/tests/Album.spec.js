"use strict"

define(["dojo/_base/declare",
  "../model/Album",
  "../model/Collection"],
function (declare, Album, Collection) {
  var album = null
  var places = null

  describe("Album", function () {
    it("should initialize album", function () {
      album = new Album({
        title: "new",
        id: 10,
        places: [{
          title: "new",
          id: 10,
          photos: [{
            title: "1",
            id: -1
          }, {
            title: "2",
            id: -1
          }]
        }]
      })
      places = album.getPlaces()
      expect(places).toBeInstanceOf(Collection)
      expect(places.size()).toEqual(1)
      expect(album.getTitle()).toEqual("new")
      expect(album.isOwner()).toBeFalsy()
    })

    it("should return true for owner check", function () {
      album = new Album({
        title: "new",
        isOwner: true,
        places: []
      })

      expect(album.isOwner()).toBeTruthy()
    })
  })
})
