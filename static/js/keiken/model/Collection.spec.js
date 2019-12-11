"use strict"

define([
  "../model/Collection",
  "../model/Photo"
],
function (Collection, Photo) {
  var photoCollection
  var photo100
  var photo200
  var photo300
  var photo101

  describe("Collection", function () {
    beforeEach(function () {
      photo101 = new Photo({
        id: 101,
        title: "Photo 101",
        order: 101
      })
      photo100 = new Photo({
        id: 100,
        title: "Photo 100",
        order: 100
      })
      photo200 = new Photo({
        id: 200,
        title: "Photo 200",
        order: 200
      })
      photo300 = new Photo({
        id: 300,
        title: "Photo 300",
        order: 300
      })

      photoCollection = new Collection([photo300, photo100, photo200], {
        orderBy: "order",
        modelType: "Photo"
      })
    })
    it("initial sorting", function () {
      expect(photoCollection.getAll()).toEqual([photo300, photo200, photo100])
    })
    it("manual sorting", function () {
      // shuffle Collection again
      photoCollection.insert(photo101)
      expect(photoCollection.getAll()).toEqual([photo300, photo200, photo101, photo100])
    })
    it("accessor methods", function () {
      expect(photoCollection.has(101)).toBe(-1)
      expect(photoCollection.has(100)).toBe(2)
      expect(photoCollection.has(200)).toBe(1)
      expect(photoCollection.getById(100)).toBe(photo100)
      expect(photoCollection.getByIndex(0)).toBe(photo300)
      expect(photoCollection.getByAttribute("title", "Photo 300")).toBe(photo300)
      expect(photoCollection.getByAttribute("order", 200)).toBe(photo200)
      expect(photoCollection.size()).toBe(3)
    })
    it("insert", function (done) {
      expect(function () {
        photoCollection.insert(photo100)
      }).toThrow()

      photoCollection.onInsert(function (model) {
        expect(model).toBe(photo101)
        expect(photoCollection.getById(101)).toBe(photo101)
        done()
      })

      photoCollection.insert(photo101)
    })

    it("delete", function (done) {
      expect(function () {
        photoCollection.delete(photo101)
      }).toThrow()
      photoCollection.onDelete(function (model) {
        expect(model).toBe(photo100)
        expect(photoCollection.has(100)).toBe(-1)
        done()
      })
      photoCollection.delete(photo100)
    })

    it("should trigger onUpdate", function (done) {
      photoCollection.onUpdate(function (model) {
        expect(model).toEqual(photo100)
        done()
      })
      $(photoCollection.getById(100)).trigger("updated", photo100)
    })

    it("should remove event listeners", function () {
      photoCollection.onDelete(function () {
        throw new Error("Not supposed to trigger onDelete")
      }, this, "Test")
      photoCollection.removeEvents("Test", "deleted")
      $(photoCollection).trigger("deleted")
    })

    it("emptyCollection", function () {
      photoCollection = new Collection([], {
        orderBy: "order",
        modelType: "photo"
      })
      photoCollection.insert(photo100)
      expect(photoCollection.getByIndex(0)).toBeDefined()
    })

    it("should be an empty collection", function () {
      photoCollection = new Collection([], {
        modelType: "Photo"
      })
      expect(photoCollection.isEmpty()).toBeTruthy()
    })

    it("should not be an empty collection", function () {
      expect(photoCollection.isEmpty()).toBeFalsy()
    })
  })
})
