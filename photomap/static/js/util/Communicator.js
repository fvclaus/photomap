/*jslint */
/*global $, define, assertTrue, assertNumber */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class Mediator for communication between classes.
 */


define(["dojo/_base/declare"],
       function (declare) {
          var Communicator = declare(null, {
             constructor : function () {
                this.events = {};
             },
             /**
              * @public
              * @description Subscribe to one or multiple events
              * @param {String} name Name(s) of the event(s). Should have the following structure: "change:photo" or "change:photo change:place change:album"
              * @param {Function} handler Function to be executed when the event is triggered
              * @param {Object} context thisReference for the handler
              * @param {Number} counter counter to limit activation times of passed handler
              */
             subscribe : function (name, handler, context, counter) {
                assertTrue(name !== undefined && handler !== undefined, "Eventname and handler have to be specified");
                
                var instance = this,
                    events = this._parse(name);
                
                if (context && typeof context === "number") {
                   counter = context;
                   context = null;
                } else {
                   context = context || null;
                   if (counter) {
                      assertNumber(counter, "event-counter has to be a number");
                   } else {
                      counter = null;
                   }
                }
                
                $.each(events, function (index, event) {
                   instance._insertHandler(event, handler, context, counter);
                });
                
             },
             /**
              * @public
              * @description Convenience method for subscribe(name, handler, context, 1)
              */
             subscribeOnce : function (name, handler, context) {
                
                context = context || null;
                this.subscribe(name, handler, context, 1);
             },
             /**
              * @public
              * @description Unsubscribe one or multiple events
              * @param {String} name Name(s) of the event(s). Should have the following structure: "change:photo" or "change:photo change:place change:album"
              * @param {Function} handler Handler that's supposed to get removed
              */
             unsubscribe : function (name, handler) {
                assertTrue(name !== undefined && handler !== undefined, "Eventname and handler have to be specified");
                
                var instance = this,
                    events = this._parse(name);
                
                $.each(events, function (index, event) {
                   instance._deleteHandler(event, handler);
                });
             },
             /**
              * @public
              * @description Trigger/publish an event
              * @param {String} name Name of the event. Should have the following structure: "change:photo"
              * @param {Object} data Data-Object which is passed to the event-handler
              */
             publish : function (name, data) {
                
                this._triggerEvent(name, data);
             },
             /**
              * @private
              * @description creates an array out of the given string
              */
             _parse : function (events) {
                
                var separator = /\s+/;
                
                if (separator.test(events)) {
                   events = events.split(separator);
                } else {
                   events = [events];
                }
                
                return events;
             },
             /**
              * @private
              */
             _insertEvent : function (name) {
                
                var event = {
                   "name": name,
                   "treatments": []
                };
                this.events[name] = event;
                
                return this.events[name];
             },
             /**
              * @private
              */
             _deleteEvent : function (name) {
                
                if (this.events[name]) {
                   delete this.events[name];
                   console.log("Event '" + name + "' was deleted.");
                } else {
                   console.log("Event '" + name + "' doesn't exist!");
                }
             },
             /**
              * @private
              */
             _insertHandler : function (name, handler, context, counter) {
                
                var event = this.events[name] || this._insertEvent(name);
                
                event.treatments.push({
                   "handler": handler,
                   "context": context,
                   "counter": counter
                });
                console.log("Started listening to '" + name + "'.");
             },
             /**
              * @private
              */
             _deleteHandler : function (name, handler) {
                
                var event = this.events[name];
                
                if (event) {
                   console.log("Stopped listening to '" + name + "'.");
                   event.treatments = event.treatments.filter(function (treatment) {
                      return (treatment.handler.toString() !== handler.toString());
                   });
                   if (event.treatments.length === 0) {
                      this._deleteEvent(name);
                   }
                } else {
                   console.log("Event '" + name + "' doesn't exist!");
                }
             },
             /**
              * @private
              */
             _triggerEvent : function (name, data) {
                
                var instance = this,
                    event = this.events[name];
                
                if (event) {
                   console.log("'" + name + "' was triggered.");
                   $.each(event.treatments, function (index, treatment) {
                      treatment.handler.call(treatment.context, data);
                      if (treatment.counter) {
                         treatment.counter--;
                         if (treatment.counter <= 0) {
                            instance._deleteHandler(name, treatment.handler);
                         }
                      }
                   });
                } else {
                   console.log("Event '" + name + "' doesn't exist!");
                }
             }
          }),
         
          _instance = new Communicator();
          return _instance;
       });