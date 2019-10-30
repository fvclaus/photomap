/* global define, $, QUnit, FormData */

"use strict"

define(["dojo/_base/declare",
  "../model/Place",
  "../model/Collection"],
function (declare, Place, Collection) {
  var place = null
  var photos = null

  module("Place", {})

  QUnit.test("easy", function () {
    place = new Place({
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
    photos = place.getPhotos()
    QUnit.ok(photos instanceof Collection)
    QUnit.ok(photos.size() === 2)
    QUnit.ok(place.getTitle() === "new")
    QUnit.ok(place.getId() === 10)
  })
})
