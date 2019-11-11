"use strict"

define(["../model/Album",
  "../model/Collection"],
function (Album, Collection) {
  describe("Album", function () {
    var album = null
    var places = null

    beforeEach(function () {
      album = new Album({
        title: "Title",
        id: 10,
        places: [{
          title: "Title",
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
    })

    it("should create empty album", function () {
      var album = new Album()
      expect(album.getTitle()).toBeUndefined()
    })

    it("should initialize album", function () {
      places = album.getPlaces()
      expect(places).toBeInstanceOf(Collection)
      expect(places.size()).toEqual(1)
      expect(album.getTitle()).toEqual("Title")
      expect(album.isOwner()).toBeFalsy()
    })

    it("should ignore places on _updateProperties", function () {
      album._updateProperties({
        title: "New title",
        places: []
      })
      expect(album.getPlaces()).toBeInstanceOf(Collection)
      expect(album.getTitle()).toBe("New title")
    })

    it("should return true for owner check", function () {
      album = new Album({
        title: "Title",
        isOwner: true,
        places: []
      })

      expect(album.isOwner()).toBeTruthy()
    })
  })
})
