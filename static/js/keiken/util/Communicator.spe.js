"use strict"

define([
  "./Communicator"
],
function (communicator) {
  function assertEventObject (actual, expected) {
    var valid = true

    if (!actual.type || (actual.type && actual.type !== expected.type)) {
      valid = false
    }
    if (!actual.name || (actual.name && actual.name !== expected.name)) {
      valid = false
    }
    if (!actual.handler || (actual.handler && actual.handler !== expected.handler)) {
      valid = false
    }
    if (!actual.context || (actual.context && actual.context !== expected.context)) {
      valid = false
    }
    if (!actual.counter || (actual.counter && actual.counter !== expected.counter)) {
      valid = false
    }
    expect(valid).toBeTruthy()
  }

  var validEventTypes = ["click", "mouseover", "hover"]
  var validEventNames = ["Gallery", "Marker", "Slideshow"]
  var invalidEvents = ["click:", "click.Photo", "click::Photo", "click:Photo_", "cl1ck", "c+lick:Photo"]
  var dataObject = { Berlin: "Rocks!" }
  var nTimes = Math.round(Math.random() * 10)
  var handlerObject = {
    ok: function () {
      // TODO done?
      expect(true).toBeTruthy()
    },
    thisHandler: function () {
      this.ok()
    },
    dataHandler: function (data) {
      expect(data).toEqual(dataObject)
    },
    handler: function () {
      // TODO done?
      expect(true).toBeTruthy()
    },
    doNothingHandler: function () {
      console.log("Doing nothing.")
    }
  }
  var thisRef = {
    type: "",
    name: "",
    handler: handlerObject.doNothingHandler,
    context: handlerObject,
    counter: nTimes
  }
  var event1 = validEventTypes[0] + ":" + validEventNames[0]
  var event7 = validEventTypes[1] + ":" + validEventNames[0]
  var event2 = validEventTypes[0] + ":" + validEventNames[1]
  var event3 = validEventTypes[0] + ":" + validEventNames[1]
  var event6 = validEventTypes[2] + ":" + validEventNames[1]
  var event4 = validEventTypes[1]
  var event5 = validEventTypes[2]
  var event8 = validEventTypes[0]
  var name45 = validEventNames[2]
  var events = event1 + " " + event2 + " " + event3 + " " + event4 + " " + event5
  var defaultEvent = { handler: handlerObject.doNothingHandler, context: handlerObject, counter: nTimes }
  var expectedEvent1 = $.extend({}, defaultEvent, { type: validEventTypes[0], name: validEventNames[0] })
  var expectedEvent2 = $.extend({}, defaultEvent, { type: validEventTypes[0], name: validEventNames[1] })
  var expectedEvent3 = $.extend({}, defaultEvent, { type: validEventTypes[0], name: validEventNames[1] })
  var expectedEvent4 = $.extend({}, defaultEvent, { type: validEventTypes[1], name: name45 })
  var expectedEvent5 = $.extend({}, defaultEvent, { type: validEventTypes[2], name: name45 })
  var expectedEvent6 = { type: validEventTypes[2], name: validEventNames[1], handler: handlerObject.handler, context: thisRef, counter: 1 }
  var expectedEvent7 = $.extend({}, defaultEvent, { type: validEventTypes[1], name: validEventNames[0] })
  var expectedEvent8 = { type: validEventTypes[0], name: "unnamed", handler: handlerObject.handler, context: thisRef, counter: 1 }

  describe("Communicator", function () {
    beforeEach(function () {
      // reset the communicator by removing all events - just in case ;)
      communicator.clear()
    })
    afterEach(function () {
      // reset the communicator by removing all events
      communicator.clear()
    })

    // Test invalid input
    it("invalid event strings", function () {
      invalidEvents.forEach(function (event) {
        expect(function () {
          communicator.subscribe(event, handlerObject.doNothingHandler)
        }).toThrow()
      })
    });

    [
      [event1],
      [{
        event: {
          context: null,
          counter: 1
        }
      }],
      [{
        event: {
          handler: "NoHandler",
          context: null,
          counter: 1
        }
      }],
      [2, handlerObject.doNothingHandler],
      [{
        event: {
          handler: handlerObject.doNothingHandler,
          context: "null",
          counter: "1"
        }
      }],
      [":" + validEventNames[0], handlerObject.doNothingHandler]

    ].forEach(function (testDefinition) {

    })

    it("invalid subscribe input", function () {
      expect(function () {
        communicator.subscribe(event1)
      }).toThrowError(/InvalidInputError/)
      expect(function () {
        communicator.subscribe({
          event: 1
        })
      }).toThrowError(/InvalidInputError/)
      expect(function () {
        communicator.subscribe({
          event: {
            context: null,
            counter: 1
          }
        })
      }).toThrowError(/InvalidInputError/)
      expect(function () {
        communicator.subscribe({
          event: {
            handler: "NoHandler",
            context: null,
            counter: 1
          }
        })
      }).toThrowError(/InvalidInputError/)
      expect(function () {
        communicator.subscribe(2, handlerObject.doNothingHandler)
      }).toThrowError(/InvalidInputError/)
      expect(function () {
        communicator.subscribe({
          event: {
            handler: handlerObject.doNothingHandler,
            context: "null",
            counter: "1"
          }
        })
      }).toThrowError(/InvalidInputError/)
      expect(function () {
        communicator.subscribe(":" + validEventNames[0], handlerObject.doNothingHandler)
      }).toThrowError(/InvalidEventType/)
      expect(function () {
        communicator.subscribe(validEventTypes[0], handlerObject.doNothingHandler, ":" + validEventNames[0])
      }).toThrowError(/InvalidNameSyntax/)
      expect(function () {
        communicator.subscribe({
          event: handlerObject.doNothingHandler
        }, 1, 2)
      }).toThrowError(/DuplicatedArgumentType/)
      expect(function () {
        communicator.subscribe("event", handlerObject.doNothingHandler, 2, 5)
      }).toThrowError(/DuplicatedArgumentType/)
      expect(function () {
        communicator.subscribeOnce("event", handlerObject.doNothingHandler, 1)
      }).toThrowError(/DuplicatedArgumentType/)
    })

    it(".subscribe(events, handler, name, context, counter)", function () {
      communicator.subscribe(events, handlerObject.doNothingHandler, name45, handlerObject, nTimes)

      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][0], expectedEvent2)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][1], expectedEvent3)
      assertEventObject(communicator.events[validEventTypes[1]][validEventNames[2]][0], expectedEvent4)
      assertEventObject(communicator.events[validEventTypes[2]][validEventNames[2]][0], expectedEvent5)
    })
    it(".subscribe(events, name, context, counter) - events is object with {event: handler, event: {handler: .., context: .. counter: ..}}", function () {
      communicator.subscribe({
        "click:Gallery": handlerObject.doNothingHandler,
        "click:Marker": handlerObject.doNothingHandler,
        "mouseover:Slideshow": handlerObject.doNothingHandler,
        "hover:Slideshow": handlerObject.doNothingHandler,
        "hover:Marker": {
          handler: handlerObject.handler,
          context: thisRef,
          counter: 1
        }
      }, name45, handlerObject, nTimes)

      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][0], expectedEvent2)
      assertEventObject(communicator.events[validEventTypes[1]][validEventNames[2]][0], expectedEvent4)
      assertEventObject(communicator.events[validEventTypes[2]][validEventNames[2]][0], expectedEvent5)
      assertEventObject(communicator.events[validEventTypes[2]][validEventNames[1]][0], expectedEvent6)
    })
    it(".subscribe(events, handler) - where event-name stays undefined", function () {
      communicator.subscribe(event8, handlerObject.handler, thisRef, 1)
      assertEventObject(communicator.events[validEventTypes[0]].unnamed[0], expectedEvent8) // +1
      communicator.publish(event8) // +1
      expect(Object.keys(communicator.events).length).toBe(0)
    })
    it(".subscribeOnce(events, handler)", function () {
      communicator.subscribeOnce(event6, handlerObject.handler, thisRef)
      communicator.subscribeOnce(event8, handlerObject.handler, thisRef)
      assertEventObject(communicator.events[validEventTypes[2]][validEventNames[1]][0], expectedEvent6) // +1
      assertEventObject(communicator.events[validEventTypes[0]].unnamed[0], expectedEvent8) // +1
      communicator.publish(event6) // +1
      communicator.publish(event8) // +1
      expect(Object.keys(communicator.events).length).toBe(0)
    })
    it(".unsubscribe(events, handler)", function () {
      communicator.subscribe(event1, handlerObject.doNothingHandler, name45, handlerObject, nTimes)
      communicator.subscribe(event2, handlerObject.doNothingHandler, name45, handlerObject, nTimes)
      communicator.subscribe(event7, handlerObject.doNothingHandler, name45, handlerObject, nTimes)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][0], expectedEvent2)
      assertEventObject(communicator.events[validEventTypes[1]][validEventNames[0]][0], expectedEvent7)
      communicator.unsubscribe(event1, handlerObject.doNothingHandler)
      communicator.unsubscribe(event2, handlerObject.doNothingHandler)
      communicator.unsubscribe(event7, handlerObject.doNothingHandler)
      expect(Object.keys(communicator.events).length).toBe(0)
    })
    it(".unsubscribe(events) where events is an event, event-name or an event-type", function () {
    // unsubscribe to event
      communicator.subscribe(event1, handlerObject.doNothingHandler, handlerObject, nTimes)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1)
      communicator.unsubscribe(event1)
      expect(Object.keys(communicator.events).length).toBe(0)
      // unsubscribe to type
      communicator.subscribe(event1, handlerObject.doNothingHandler, handlerObject, nTimes)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1)
      communicator.unsubscribe(validEventTypes[0])
      expect(Object.keys(communicator.events).length).toBe(0)
      // unsubscribe to name
      communicator.subscribe(event1, handlerObject.doNothingHandler, handlerObject, nTimes)
      communicator.subscribe(event7, handlerObject.doNothingHandler, handlerObject, nTimes)
      assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1)
      assertEventObject(communicator.events[validEventTypes[1]][validEventNames[0]][0], expectedEvent7)
      communicator.unsubscribe(":" + validEventNames[0])
      console.log(communicator.events)
      expect(Object.keys(communicator.events).length).toBe(0)
    })
    it(".trigger(events) where events is an event, event-name or an event-type", function () {
      communicator.subscribe(events, handlerObject.handler, name45)
      // trigger event -> +3
      communicator.publish(event1) // +1
      communicator.publish(event2) // +2
      // trigger type -> +3
      communicator.publish(validEventTypes[0])
      // trigger name -> +2
      communicator.publish(":" + name45)
    })
    it(".trigger(events) - test context", function () {
      communicator.subscribe(event1, handlerObject.thisHandler, handlerObject)
      communicator.publish(event1)
    })
    it(".trigger(events) - test counter", function () {
      expect(nTimes + 1)
      var i

      communicator.subscribe(event1, handlerObject.handler, nTimes)
      for (i = 0; i < nTimes; i++) {
        communicator.publish(event1)
      }
      expect(Object.keys(communicator.events).length).toBe(0)
    })
    it(".trigger(events) - test passing of data", function () {
      communicator.subscribe(event1, handlerObject.dataHandler)
      communicator.publish(event1, dataObject)
    })
  })
})
