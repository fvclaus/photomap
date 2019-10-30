/* global define, $, QUnit, FormData */

"use strict"

define(["dojo/_base/declare",
  "../model/Photo",
  "./ModelServerTest"],
function (declare, Photo, ModelServerTest) {
  var photo = null
  var expectedUrl = null
  var newData = null

  module("Photo", {
  })

  QUnit.test("easy", function () {
    photo = new Photo({
      title: "Blah",
      photo: "photo",
      thumb: "thumb",
      order: 2
    })
    QUnit.ok(photo.getOrder() === 2)
    QUnit.ok(photo.getPhoto() === "photo")
    QUnit.ok(photo.getThumb() === "thumb")
    QUnit.ok(photo.isVisited() === false)
    photo.setVisited(true)
    QUnit.ok(photo.isVisited() === true)
    QUnit.ok(typeof photo.toString() === "string")
    QUnit.ok(photo.getSource("photo") === "photo")
    QUnit.ok(photo.getSource("thumb") === "thumb")
  })

  QUnit.test("hard", 25, function () {
    var server = new ModelServerTest()
    photo = new Photo({ title: "old", id: -1 })
    server.register(photo)

    newData = { title: "new" }
    server.expect("/photo/", newData)
    photo.save(newData)

    photo.id = 5
    newData = { description: "new", isPhotoUpload: true }
    server.expect("/photo/5/", newData)
    photo.save(newData)

    server.unregister()
  })
})
