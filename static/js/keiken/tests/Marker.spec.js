"use strict"

define(["dojo/_base/declare",
  "../model/MarkerModel"],
function (declare, Marker) {
  var marker = null

  describe("Marker", function () {
    it("should return lat/lng on getter", function () {
      marker = new Marker({
        title: "Title",
        type: "Photo",
        lat: 77.8,
        lon: 20.34
      })
      expect(marker.getLat()).toBeCloseTo(77.8)
      expect(marker.getLng()).toBeCloseTo(20.34)
    })
  })
})
