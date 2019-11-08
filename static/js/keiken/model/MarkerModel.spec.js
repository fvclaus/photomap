"use strict"

define(["../model/MarkerModel"],
  function (MarkerModel) {
    describe("MarkerModel", function () {
      it("should create empty marker", function () {
        var marker = new MarkerModel()
        expect(marker.getLat()).toBeUndefined()
        expect(marker.getLng()).toBeUndefined()
      })
      it("should create marker with lat/lng", function () {
        var marker = new MarkerModel({
          lat: 20,
          lng: 30
        })
        expect(marker.getLat()).toBe(20)
        expect(marker.getLng()).toBe(30)
      })
    })
  })
