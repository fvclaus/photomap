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

    it("should subscribe only once", function () {
      var triggeredHandler = 0
      communicator.subscribeOnce("load:Gallery", function () {
        triggeredHandler++
      })
      communicator.publish("load:Gallery")
      communicator.publish("load:Gallery")
      expect(triggeredHandler).toBe(1)
    })
  })
})
