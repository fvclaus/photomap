/*jslint */
/*global $, define, QUnit, module, expect */

"use strict";

define([
   "../util/Communicator",
   "./TestFixture"
],
   function (communicator, TestFixture) {
      
      function getShuffledIntegerArray(nInteger) {
         var x = [],
            y = [],
            i;
         if (nInteger <= 0) {
            return [];
         }
         if (nInteger === 1) {
            return [nInteger];
         }
         for (i = 0; i < nInteger; i++) {
            x.push(i);
         }
         while (x.length) {
            y.push(x.splice(Math.random() * x.length, 1)[0]);
         }
         return y;
      }
      function assertEventObject(actual, expected) {
         var valid = true, noMatch = "None";
         
         if (!actual.type || (actual.type && actual.type !== expected.type)) {
            valid = false;
            noMatch = "type";
         }
         if (!actual.name || (actual.name && actual.name !== expected.name)) {
            valid = false;
            noMatch = "name";
         }
         if (!actual.handler || (actual.handler && actual.handler !== expected.handler)) {
            valid = false;
            noMatch = "handler";
         }
         if (!actual.context || (actual.context && actual.context !== expected.context)) {
            valid = false;
            noMatch = "context";
         }
         if (!actual.counter || (actual.counter && actual.counter !== expected.counter)) {
            valid = false;
            noMatch = "counter";
         }
         QUnit.ok(valid, "testing whether Event-Object matches expected one - not matching: " + noMatch);
      }
      
      var validEventTypes = ["click", "mouseover", "hover"],
         validEventNames = ["Gallery", "Marker", "Slideshow"],
         invalidEvents = ["click:", "click.Photo", "click::Photo", "click:Photo_", "cl1ck", "c+lick:Photo"],
         dataObject = {Berlin: "Rocks!"},
         nTimes = Math.round(Math.random() * 10),
         handlerObject = {
            ok: function () {
               QUnit.ok(1, "testing if thisReference is passed to event handler");
            },
            thisHandler: function () {
               this.ok();
            },
            dataHandler: function (data) {
               QUnit.equal(data, dataObject, "testing if data is passed to event handler");
            },
            handler: function () {
               QUnit.ok(1, "testing if handler is called when event is published.");
            },
            doNothingHandler: function () {
               console.log("Doing nothing.");
            }
         },
         thisRef = {
            type: "",
            name: "",
            handler: handlerObject.doNothingHandler,
            context: handlerObject,
            counter: nTimes
         },
         event1 = validEventTypes[0] + ":" + validEventNames[0],
         event7 = validEventTypes[1] + ":" + validEventNames[0],
         event2 = validEventTypes[0] + ":" + validEventNames[1],
         event3 = validEventTypes[0] + ":" + validEventNames[1],
         event6 = validEventTypes[2] + ":" + validEventNames[1],
         event4 = validEventTypes[1],
         event5 = validEventTypes[2],
         event8 = validEventTypes[0],
         name45 = validEventNames[2],
         events = event1 + " " + event2 + " " + event3 + " " + event4 + " " + event5,
         defaultEvent = {handler: handlerObject.doNothingHandler, context: handlerObject, counter: nTimes},
         expectedEvent1 = $.extend({}, defaultEvent, {type: validEventTypes[0], name: validEventNames[0]}),
         expectedEvent2 = $.extend({}, defaultEvent, {type: validEventTypes[0], name: validEventNames[1]}),
         expectedEvent3 = $.extend({}, defaultEvent, {type: validEventTypes[0], name: validEventNames[1]}),
         expectedEvent4 = $.extend({}, defaultEvent, {type: validEventTypes[1], name: name45}),
         expectedEvent5 = $.extend({}, defaultEvent, {type: validEventTypes[2], name: name45}),
         expectedEvent6 = {type: validEventTypes[2], name: validEventNames[1], handler: handlerObject.handler, context: thisRef, counter: 1},
         expectedEvent7 = $.extend({}, defaultEvent, {type: validEventTypes[1], name: validEventNames[0]}),
         expectedEvent8 = {type: validEventTypes[0], name: "unnamed", handler: handlerObject.handler, context: thisRef, counter: 1};
      
      module("Communicator", {
         setup: function () {
            // reset the communicator by removing all events - just in case ;)
            communicator.clear();
         },
         tearDown: function () {
            // reset the communicator by removing all events
            communicator.clear();
         }
      });
      
      // Test invalid input
      QUnit.test("invalid event strings", 6, function () {
         invalidEvents.forEach(function (event) {
            QUnit.throws(function () {
               communicator.subscribe(event, handlerObject.doNothingHandler);
            }, /InvalidEventSyntax/, "testing if following wrong event-syntax passes the assertions in Communicator: " + event);
         });
      });
      QUnit.test("invalid subscribe input", 11, function () {
         QUnit.throws(function () {
            communicator.subscribe(event1);
         }, /InvalidInputError/, "testing whether missing handler throws error when events-input is string");
         QUnit.throws(function () {
            communicator.subscribe({
               "event": 1
            });
         }, /InvalidInputError/, "testing whether missing handler throws error when events input is {name: handler}");
         QUnit.throws(function () {
            communicator.subscribe({
               "event": {
                  context: null,
                  counter: 1
               }
            });
         }, /InvalidInputError/, "testing whether missing handler throws error when events input is {name: {handler: function () {}}}");
         QUnit.throws(function () {
            communicator.subscribe({
               "event": {
                  handler: "NoHandler",
                  context: null,
                  counter: 1
               }
            });
         }, /InvalidInputError/, "testing whether missing handler throws error when events input is {name: {handler: function () {}}}");
         QUnit.throws(function () {
            communicator.subscribe(2, handlerObject.doNothingHandler);
         }, /InvalidInputError/, "testing whether events invalid 'events'-input-type throws error");
         QUnit.throws(function () {
            communicator.subscribe({
               "event": {
                  handler: handlerObject.doNothingHandler,
                  context: "null",
                  counter: "1"
               }
            });
         }, /InvalidInputError/, "testing whether invalid event-options-types cause error");
         QUnit.throws(function () {
            communicator.subscribe(":" + validEventNames[0], handlerObject.doNothingHandler);
         }, /InvalidEventType/, "testing whether subscribing to a name (without event-type specified) throws error");
         QUnit.throws(function () {
            communicator.subscribe(validEventTypes[0], handlerObject.doNothingHandler, ":" + validEventNames[0]);
         }, /InvalidNameSyntax/, "testing whether wrong name input (eg. subscribe('click', handler, ':Gallery')) throws error");
         QUnit.throws(function () {
            communicator.subscribe({
               "event": handlerObject.doNothingHandler
            }, 1, 2);
         }, /DuplicatedArgumentType/, "testing whether duplicated input parameter types cause error ");
         QUnit.throws(function () {
            communicator.subscribe("event", handlerObject.doNothingHandler, 2, 5);
         }, /DuplicatedArgumentType/, "testing whether duplicated input parameter types cause error ");
         QUnit.throws(function () {
            communicator.subscribeOnce("event", handlerObject.doNothingHandler, 1);
         }, /DuplicatedArgumentType/, "testing whether passing a counter to subscribeOnce causes error");
      });
      QUnit.test(".subscribe(events, handler, name, context, counter)", 5, function () {
         
         communicator.subscribe(events, handlerObject.doNothingHandler, name45, handlerObject, nTimes);
         
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][0], expectedEvent2);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][1], expectedEvent3);
         assertEventObject(communicator.events[validEventTypes[1]][validEventNames[2]][0], expectedEvent4);
         assertEventObject(communicator.events[validEventTypes[2]][validEventNames[2]][0], expectedEvent5);
      });
      QUnit.test(".subscribe(events, name, context, counter) - events is object with {event: handler, event: {handler: .., context: .. counter: ..}}", 5, function () {
         
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
         }, name45, handlerObject, nTimes);
         
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][0], expectedEvent2);
         assertEventObject(communicator.events[validEventTypes[1]][validEventNames[2]][0], expectedEvent4);
         assertEventObject(communicator.events[validEventTypes[2]][validEventNames[2]][0], expectedEvent5);
         assertEventObject(communicator.events[validEventTypes[2]][validEventNames[1]][0], expectedEvent6);
      });
      QUnit.test(".subscribe(events, handler) - where event-name stays undefined", 3, function () {
         
         communicator.subscribe(event8, handlerObject.handler, thisRef, 1);
         assertEventObject(communicator.events[validEventTypes[0]].unnamed[0], expectedEvent8); // +1
         communicator.publish(event8); // +1
         QUnit.equal(Object.keys(communicator.events).length, 0, "testing if handler was successfully deleted from unnamed collection"); // +1
      });
      QUnit.test(".subscribeOnce(events, handler)", 5, function () {
         
         communicator.subscribeOnce(event6, handlerObject.handler, thisRef);
         communicator.subscribeOnce(event8, handlerObject.handler, thisRef);
         assertEventObject(communicator.events[validEventTypes[2]][validEventNames[1]][0], expectedEvent6); // +1
         assertEventObject(communicator.events[validEventTypes[0]].unnamed[0], expectedEvent8); // +1
         communicator.publish(event6); // +1
         communicator.publish(event8); // +1
         QUnit.equal(Object.keys(communicator.events).length, 0, "testing if events were successfully deleted after 1 publish"); // +1
      });
      QUnit.test(".unsubscribe(events, handler)", 4, function () {
         
         communicator.subscribe(event1, handlerObject.doNothingHandler, name45, handlerObject, nTimes);
         communicator.subscribe(event2, handlerObject.doNothingHandler, name45, handlerObject, nTimes);
         communicator.subscribe(event7, handlerObject.doNothingHandler, name45, handlerObject, nTimes);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[1]][0], expectedEvent2);
         assertEventObject(communicator.events[validEventTypes[1]][validEventNames[0]][0], expectedEvent7);
         communicator.unsubscribe(event1, handlerObject.doNothingHandler);
         communicator.unsubscribe(event2, handlerObject.doNothingHandler);
         communicator.unsubscribe(event7, handlerObject.doNothingHandler);
         QUnit.equal(Object.keys(communicator.events).length, 0, "testing if events were successfully deleted and if the removing bubbles up and removes type when empty");
         
      });
      QUnit.test(".unsubscribe(events) where events is an event, event-name or an event-type", 7, function () {
         
         //unsubscribe to event
         communicator.subscribe(event1, handlerObject.doNothingHandler, handlerObject, nTimes);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1);
         communicator.unsubscribe(event1);
         QUnit.equal(Object.keys(communicator.events).length, 0, "testing if handler was successfully deleted and if the removing bubbles up and removes type when empty");
         // unsubscribe to type
         communicator.subscribe(event1, handlerObject.doNothingHandler, handlerObject, nTimes);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1);
         communicator.unsubscribe(validEventTypes[0]);
         QUnit.equal(Object.keys(communicator.events).length, 0, "testing if handler was successfully deleted and if the removing bubbles up and removes type when empty");
         // unsubscribe to name
         communicator.subscribe(event1, handlerObject.doNothingHandler, handlerObject, nTimes);
         communicator.subscribe(event7, handlerObject.doNothingHandler, handlerObject, nTimes);
         assertEventObject(communicator.events[validEventTypes[0]][validEventNames[0]][0], expectedEvent1);
         assertEventObject(communicator.events[validEventTypes[1]][validEventNames[0]][0], expectedEvent7);
         communicator.unsubscribe(":" + validEventNames[0]);
         console.log(communicator.events);
         QUnit.equal(Object.keys(communicator.events).length, 0, "testing if handler was successfully deleted and if the removing bubbles up and removes type when empty");
      });
      QUnit.test(".trigger(events) where events is an event, event-name or an event-type", 8, function () {
         
         communicator.subscribe(events, handlerObject.handler, name45);
         // trigger event -> +3
         communicator.publish(event1); // +1
         communicator.publish(event2); // +2
         // trigger type -> +3
         communicator.publish(validEventTypes[0]);
         // trigger name -> +2
         communicator.publish(":" + name45);
      });
      QUnit.test(".trigger(events) - test context", 1, function () {
         
         communicator.subscribe(event1, handlerObject.thisHandler, handlerObject);
         communicator.publish(event1);
      });
      QUnit.test(".trigger(events) - test counter", function () {
         expect(nTimes + 1);
         var i;
         
         communicator.subscribe(event1, handlerObject.handler, nTimes);
         for (i = 0; i < nTimes; i++) {
            communicator.publish(event1);
         }
         QUnit.equal(Object.keys(communicator.events).length, 0, "testing if handler was successfully deleted after counter reached 0");
      });
      QUnit.test(".trigger(events) - test passing of data", 1, function () {
         communicator.subscribe(event1, handlerObject.dataHandler);
         communicator.publish(event1, dataObject);
      });
   });