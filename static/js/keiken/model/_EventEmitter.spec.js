"use strict"

define([
  "dojo/_base/declare",
  "./_EventEmitter",
  "../util/Communicator"
],
function (declare, _EventEmitter, communicator) {
  describe("_EventEmitter", function () {
    var EventEmitter = declare(_EventEmitter, {
      _getEventNs: function () {
        return "EventEmitter"
      }
    })
    var eventEmitter

    beforeEach(function () {
      eventEmitter = new EventEmitter()
    })

    afterEach(function () {
      communicator.clear()
    });

    ["insert", "update", "delete"].forEach(function (eventName) {
      it("should emit change signal on " + eventName, function (done) {
        communicator.subscribeOnce("change:EventEmitter", function (emitter) {
          expect(emitter).toBe(eventEmitter)
          done()
        })
        eventEmitter._trigger(eventName)
      })
    });

    ["insert", "update", "delete"].forEach(function (signalName) {
      it("should publish " + signalName + " signal", function (done) {
        communicator.subscribeOnce(signalName + ":EventEmitter", function (emitter) {
          expect(emitter).toBe(eventEmitter)
          done()
        })
        eventEmitter._trigger(signalName)
      })
    })
  })
})
