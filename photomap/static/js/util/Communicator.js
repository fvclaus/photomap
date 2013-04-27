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
              * @description Subscribe to one or multiple events. You can specify the event(s) as string and assign a handler, a context and a counter to all of them,
              * or you specify an event-object containing event-name as key and event-handler as value and specify a general context and counter for all of them
              * or you specify an event-object containing event-name as key and as value an object containing handler and an individual context and counter for the named event
              * @param {String/Object} events Name(s) of the event(s) or event-object. Should have the following structure: 
              * "change:photo" or "change:photo change:place change:album" (=> input-param handler has to be defined! it'll be assigned to all the given events) or
              * {"change:photo": function () {...}, "change:place": function () {...}} or 
              * {"change:photo": {"handler": function () {...}, "context": this.view, "counter": 3}}
              * -> context&counter can be specified individually for each event and also generally for all events outside the object
              * eg. ({"change:photo": {"handler": function () {...}, "counter": 3}, "delete:photo": function () {...}}, this.view, 10)
              * => "change:photo" has individual counter but gets 'this.view' as context and "delete:photo" has no individual values -> takes general context (=this.view) and counter (= 10)
              * @param {Function} handler Function to be executed when the event is triggered (not needed if input param "events" is object)
              * @param {Object} context thisReference for the handler (optional)
              * @param {Number} counter counter to limit activation times of passed handler (optional)
              */
             subscribe : function (events, handler, context, counter) {
                assertTrue(events !== undefined && (typeof events === "object" || handler !== undefined), "event has to be object or else event-name and handler have to be specified");
                
                var instance = this;
              
                events = this._parse(events, handler, context, counter);
                
                $.each(events, function (name, info) {
                   instance._insertHandler(name, info);
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
                    events = this._parseEventString(name);
                
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
              * @description Creates an event-object with all given events in order to unify the event inputs
              */
             _parse :function (events, handler, context, counter) {
                
                var eventObject = {},
                   instance = this;
                
                // if input is (events{, context}{, counter}) -> no handler specified
                if (handler && typeof handler !== "function") {
                   counter = context || null;
                   context = handler;
                }
                
                // if input is (events{, handler}, counter) -> no context specified but counter (and maybe handler)
                if (context && typeof context === "number") {
                   counter = context;
                   context = null;
                   
                // if input is (events{, handler}{, context}{, counter}) -> if counter is specified, then handler and context have to be specified as well
                } else {
                   context = context || null;
                   if (counter) {
                      assertNumber(counter, "event-counter has to be a number");
                   } else {
                      counter = null;
                   }
                }
                
                // create eventObject if input is event-string with a single handler: (events, handler{, context}{, counter})
                if (typeof events === "string") {
                   
                   events = this._parseEventString(events);
                   console.log(events);
                   $.each(events, function (index, name) {
                      console.log(name);
                      eventObject[name] = {
                         "handler": handler,
                         "context": context || null,
                         "counter": counter || null
                      }
                   });
                } else if (typeof events === "object") {
                   
                   $.each(events, function (name, info) {
                      
                      // create eventObject if input is ({event-name: event-handler, ...}, context, counter)
                      if (typeof info === "function") {
                         eventObject[name] = {
                            "handler": info,
                            "context": context || null,
                            "counter": counter || null
                         }
                      } else if (typeof info === "object") {
                        //create eventObject if input is already event-object; take individual context/counter if defined, else take the general context/counter or else define it as null
                         eventObject[name] = {
                            "handler": info.handler,
                            "context": info.context || context || null,
                            "counter": info.counter || counter || null
                         }
                      }
                   });
                }
                
                return eventObject;
             },
             /**
              * @private
              * @description creates an array out of the given string
              */
             _parseEventString : function (events) {
                
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
               
                this.events[name] = {
                   "name": name,
                   "treatments": []
                };
                
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
             _insertHandler : function (name, treatment) {
                
                var event = this.events[name] || this._insertEvent(name);
                
                event.treatments.push(treatment);
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