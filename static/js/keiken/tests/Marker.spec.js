"use strict"

define(["dojo/_base/declare",
  "../model/MarkerModel",
  "./ModelServerTest"],
function (declare, Marker, ModelServerTest) {
  var marker = null
  var newData = null
  var server = null

  describe("Marker", function () {
    it("should return lat/lng on getter", function () {
      marker = new Marker({
        title: "Title",
        type: "Photo",
        lat: 77.8,
        lon: 20.34
      })
      QUnit.ok(marker.getLat() === 77.8)
      QUnit.ok(marker.getLng() === 20.34)
    })
  })

  QUnit.test("hard", 24, function () {
    server = new ModelServerTest()
    marker = new Marker({
      title: "Blah",
      type: "Album"
    })
    server.register(marker)

    newData = {
      title: "new",
      lat: 20.5,
      lng: 12.5
    }
    server.expect("/album/", newData)
    marker.save(newData)

    marker.id = 5
    newData = { description: "new" }
    server.expect("/album/5/")
    marker.save(newData)

    server.unregister()
  })
})
