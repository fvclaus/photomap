/* jslint */
/* global $, define, QUnit, module */

"use strict"

define([
  "../model/Collection",
  "../model/Photo",
  "./TestFixture"
],
function (Collection, Photo, TestFixture) {
  function getShuffledIntegerArray (nInteger) {
    var x = []
    var y = []
    var i
    if (nInteger <= 0) {
      return []
    }
    if (nInteger === 1) {
      return [nInteger]
    }
    for (i = 0; i < nInteger; i++) {
      x.push(i)
    }
    while (x.length) {
      y.push(x.splice(Math.random() * x.length, 1)[0])
    }
    return y
  }
  function assertRisingValues (array) {
    var i; var isRising = true
    for (i = 0; i < array.length; i++) {
      if (array[i] >= array[i + 1]) {
        isRising = false
        break
      }
    }
    QUnit.ok(isRising)
  }
  function assertFallingValues (array) {
    var i; var isFalling = true
    for (i = 0; i < array.length; i++) {
      if (array[i] <= array[i + 1]) {
        isFalling = false
        break
      }
    }
    QUnit.ok(isFalling)
  }
  function getOrders (arrayOfPhotos) {
    var orders = []
    arrayOfPhotos.forEach(function (photo) {
      orders.push(photo.order)
    })

    return orders
  }

  var collection
  var testFixture = new TestFixture()
  var idPhoto1 = 539
  var orderPhoto1 = 500
  var photo1
  var idPhoto2 = 987
  var orderPhoto2 = 800
  var photo2
  var idPhoto3 = 1726
  var photo3
  var titlePhoto2 = "No title."
  var indexPhoto2 = 0
  var nPhotos = 1 + parseInt(Math.random() * 10, 10)
  var photos
  var photoOrders = getShuffledIntegerArray(nPhotos)
  var photoCollection
  var i

  module("Collection", {
    setup: function () {
      photo1 = testFixture.getRandomPhoto(idPhoto1)
      photo2 = testFixture.getRandomPhoto(idPhoto2)
      photo3 = testFixture.getRandomPhoto(idPhoto3)
      photo2.title = titlePhoto2
      photos = testFixture.getRandomPhotos(nPhotos)
      photos.push(photo2)
      for (i = 0; i < nPhotos; i++) {
        photos[i].order = photoOrders[i]
      }
      photo1.order = orderPhoto1
      photo2.order = orderPhoto2
      photo3.order = orderPhoto2 // same as photo2
      photoCollection = new Collection(photos, {
        orderBy: "order",
        modelConstructor: Photo,
        modelType: "Photo"
      })
    },
    tearDown: function () {
    }
  })
  // test 1 - sorting upon creation
  QUnit.test("initial sorting", 1, function () {
    // Collections should get sorted upon creation
    assertFallingValues(getOrders(photoCollection.getAll()))
  })
  // test 2 - manual sorting
  QUnit.test("manual sorting", 1, function () {
    // shuffle Collection again
    photoCollection.getAll().sort(function () {
      return (Math.round(Math.random()) - 0.5)
    })
    // test sorting again
    photoCollection.sort()
    assertFallingValues(getOrders(photoCollection.getAll()))
  })
  // test 3 - accessor methods
  QUnit.test("accessor methods", 9, function () {
    QUnit.equal(photoCollection.has(idPhoto1), -1, "testing Collection.has with wrong id (should return -1)")
    QUnit.equal(photoCollection.has(idPhoto2), indexPhoto2, "testing Collection.has with correct id (should return index of model)")
    QUnit.equal(photoCollection.has(photo2), indexPhoto2, "testing Collection.has with model (should return index of model)")
    QUnit.equal(photoCollection.getAll(), photos, "testing Collection.getAll (should return array with all models)")
    QUnit.equal(photoCollection.get(idPhoto2), photo2, "testing Collection.get")
    QUnit.equal(photoCollection.getByIndex(1), photos[1], "testing Collection.getByIndex")
    QUnit.equal(photoCollection.getByAttribute("title", titlePhoto2), photo2, "testing Collection.getByAttribute (using title)")
    QUnit.equal(photoCollection.getByAttribute("order", orderPhoto2), photo2, "testing Collection.getByAttribute (using order)")
    QUnit.equal(photoCollection.size(), nPhotos + 1, "testing Collection.size (should return amount of models in the collection)")
  })
  // test 4 - insert
  QUnit.test("insert", 5, function () {
    QUnit.throwsError(function () {
      photoCollection.insert(photo2)
    }, /ModelDuplicationError/, "testing if Collection throws error when the inserted model already exists in the collection (models have to be unique)")
    $(photoCollection).on("inserted", function () {
      QUnit.ok(1, "testing if 'inserted' is triggered after insert")
    })
    photoCollection.insert(photo1)
    QUnit.equal(photoCollection.get(idPhoto1), photo1, "testing if model is in Collection after insert")
    // photo1 should be the second last model -> should have index equal to nPhotos
    QUnit.equal(photoCollection.has(idPhoto1), 1, "testing if model is inserted at the correct index in case Collection.options.orderBy is defined")
    // doublecheck: test again whether the Collection still is in order
    assertFallingValues(getOrders(photoCollection.getAll()))
  })
  // test 5 - delete
  QUnit.test("delete", 3, function () {
    QUnit.throwsError(function () {
      photoCollection.delete(photo1)
    }, /UnknownModelError/, "testing if Collection.delete throws error when an unknown model is given")
    $(photoCollection).on("deleted", function () {
      QUnit.ok(1, "testing if 'deleted' is triggered after delete")
    })
    photoCollection.delete(photo2)
    QUnit.equal(photoCollection.has(idPhoto2), -1, "testing if model is really removed from Collection after delete")
  })
  // test 6 - passing through of model events and reaction to model.delete
  QUnit.test("reactions to model events", 3, function () {
    $(photoCollection).on("deleted updated", function (event) {
      QUnit.ok(1, "testing if event (" + event.type + ") is also triggered on Collection")
    })
    $(photo2).trigger("updated", photo2)
    $(photo2).trigger("deleted", photo2)
    QUnit.equal(photoCollection.has(idPhoto2), -1, "testing if Collection deleted model after 'deleted' was triggered on the model")
  })
  // test 7 - adding and removing of events or event handlers on the collection (not testing ajax events!)
  QUnit.test("adding and removing event listeners", 8, function () {
    function triggerAll () {
      $(photoCollection).trigger("inserted")
      $(photoCollection).trigger("updated")
      $(photoCollection).trigger("deleted")
    }
    function bindAll () {
      photoCollection
        .onInsert(function (model) {
          QUnit.ok(1)
        }, null, "Test")
        .onUpdate(function (model) {
          QUnit.ok(1)
        }, null, "Test")
        .onDelete(function (model) {
          QUnit.ok(1)
        }, null, "Test")
    }

    bindAll()
    triggerAll() // should trigger 3
    photoCollection.removeEvents("Test", "deleted")
    triggerAll() // should trigger 2
    photoCollection.removeEvents("Test", "inserted updated")
    triggerAll() // should trigger 0
    bindAll()
    triggerAll() // should trigger 3
    photoCollection.removeEvents("Test")
    triggerAll() // should trigger 0
  })
  // test 8 - passing of model when handlers are bound by onInsert/...
  QUnit.test("passing of models to event handlers, bound by using onInsert/Update/Delete", 3, function () {
    photoCollection
      .onInsert(function (model) {
        QUnit.equal(model, photo2, "testing if onInsert passes the correct model")
      }, null, "Test")
      .onUpdate(function (model) {
        QUnit.equal(model, photo2, "testing if onUpdate passes the correct model")
      }, null, "Test")
      .onDelete(function (model) {
        QUnit.equal(model, photo2, "testing if onDelete passes the correct model")
      }, null, "Test")
    $(photoCollection).trigger("inserted", photo2)
    $(photo2).trigger("updated", photo2)
    $(photo2).trigger("deleted", photo2)
  })

  // Bug: _getCorrectIndex assumed that modelList was not empty.
  QUnit.test("emptyCollection", function () {
    photoCollection = new Collection([], {
      modelConstructor: Photo,
      orderBy: "order",
      modelType: "photo"
    })
    photoCollection.insert(photo2)
    QUnit.ok(photoCollection.getByIndex(0) !== undefined)
  })
})
