"use strict"

define([
  "./Communicator"
],
function (communicator) {
  describe("Communicator", function () {
    beforeEach(function () {
      communicator.clear()
    })

    it("should subscribe to single event", function (done) {
      communicator.subscribe("click:Gallery", function () {
        done()
      })

      communicator.publish("click:Gallery")
    })

    it("should subscribe to multiple events", function (done) {
      communicator.subscribe({
        click: function () {},
        load: function () { done() }
      }, "Gallery")

      communicator.publish("load:Gallery")
    })
  })
})
