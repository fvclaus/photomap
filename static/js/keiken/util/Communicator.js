/**
 * General Informations about this Class:
 *  - Hierarchy of this.events: {type: {name: [eventObject, eventObject}, name: [eventObject]}, type: {name: [eventObject]}}
 *  - Event-Type:
 *  --- Describes a certain type of Event (eg. "change", "click"). Mandatory!
 *  --- An Event-Type can Event-Names associated to it. If Handlers are added to an Event-Type without a Event-Name specified are put into the "unnamed"-Handler-Collection
 *  - Event-Name:
 *  --- Names a Handler-Collection of an Event-Type. Defaults to "unnamed".
 *  --- Examples: ":Gallery", ":FullscreenCloseButton"
 *  - Event-Objects:
 *  --- Event-Objects contain: type, name, handler, context and counter. The types are as below:
 *  --- read as "attribute: typeof attribute" => {type: "string", name: "string", handler: "function", context: "object", counter: "number"}
 * ------------------------------
 *  Input-Parameter for the public methods:
 *  > (events, handler, name, context, counter)
 *  > All input parameters besides "events" are optional.
 *  > Keep in mind that every event needs at least an event-type and an event-handler!
 *  - "events":
 *  --- A String containing one or more space-separated Events, Event-Types or Event-Names
 *  --- Examples: Event > "click:Gallery" | Event-Type > "click" | Event-Name > ":Gallery" | "click:Gallery click:Slideshow"
 *  --- (!) The following will be accepted: "click:Gallery :Fullscreen mouseover" - It's better to avoid this though to maintain readability! (Call the method multiple times instead or use objects @see .subscribe)
 *  --- (!) .subscribe allows only Events and Event-Types. You may not assign a handler to an Event-Name that isn't associated to a type.
 *  --- (!) .subscribe also takes an Object as "events"-parameter - @see .subscribe
 *  - "handler":
 *  --- A Function to be executed when the event is published.
 *  - "name":
 *  --- A String describing the name of an event. If "events"-input does not define a certain name for the given Event-Types, those will get this name.
 *  --- Example: subscribe({"click:Gallery": handler, "mouseover": handler, "mouseout": handler}, "Thumb") will create 3 events: "click:Gallery", "mouseover:Thumb" and "mouseout:Thumb"
 *  --- (!) Name has to be a word with just alphabets as letters: "Gallery", "Slideshow" are ok --|-- ":Gallery", ".Slideshow" are not allowed!
 *  - "context":
 *  --- this-reference for the event-handler(s)
 *  - "counter":
 *  --- Number of times the handler(s) are supposed to be executed, before they get deleted.
 *  --- If undefined handler(s) will always be triggered unless you unsubscribe on them.
 *  --- subscribeOnce is a convenience method if you want to subscribe to an event once. Same as subscribe("click", handler, 1);
 */


/*jslint */
/*global $, define */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class Mediator for communication between classes. Public methods are: .subscribe(), .subscribeOnce(), .unsubscribe(), .publish()
 */


define(["dojo/_base/declare"],
   function (declare) {
      var Communicator = declare(null, {
         constructor : function () {
            this.events = {};
         },
         /**
          * @public
          * @description Subscribe to one or multiple events.
          * @param {String/Object} events May be a String of one or more space-separated event/event-types. May also be an object with one of the following structures:
          * (1) {event: handler, event: handler} || (2) {event: {handler: "function", context: "object", counter: "number"}, event: {...}}.
          * (!) about (2): all the options given in the event-object will overwrite the "default"-options given as additional parameter to subscribe
          * (eg. subscribe(..., context, counter)) -> it is possible to use the default for some events and specify different options for another in the same .subscribe() call
          * (!) At least 1 event/event-type and 1 handler have to be passed to subscribe. Counter and context are optional and default to null.
          */
         subscribe : function (events, handler, name, context, counter) {
            this._assertEventsInput(events);
            var instance = this,
               eventObjectList = this._parse(events, handler, name, context, counter);

            eventObjectList.forEach(function (eventObject) {
               instance._insert(eventObject);
            });

         },
         /**
          * @public
          * @description Convenience method for subscribe(events, name, handler, context, 1)
          */
         subscribeOnce : function (events, handler, name, context) {
            this.subscribe(events, handler, name, context, 1);
         },
         /**
          * @public
          * @description Unsubscribe one or multiple events
          * @param {String} name Event-types/names or specific events (=type:name combination). Should have the following structure: "change", ":photo", "change:photo", "change:photo change:place"
          * @param {Function} handler (Optional) Handler that's supposed to get removed.
          */
         unsubscribe : function (events, handler) {
            this._assertEventsInput(events);
            var instance = this,
               eventList = this._parseEventString(events);

            if (handler) {
               this._removeHandler(eventList[0], handler);
               return;
            }

            eventList.forEach(function (event) {
               instance._remove(event);
            });
         },
         /**
          * @public
          * @description Trigger/publish an event
          * @param {String} name Event-types/names or specific events (=type:name combination). Should have the following structure: "change:photo", "change", ":photo", "change:photo change:place"
          * @param {Object} data Data-Object which is passed to each event-handler
          */
         publish : function (events, data) {
            this._assertEventsInput(events);
            var instance = this,
               eventList = this._parseEventString(events);

            eventList.forEach(function (event) {
               instance._trigger(event, data);
            });
         },

         /* ------------------------------------------------------------------------------------------------ */
         /* --------------------------------- Insertion of Events-Handlers --------------------------------- */
         /* ------------------------------------------------------------------------------------------------ */
         _insert: function (eventObject) {
            var namedCollection = this._getName(eventObject.type, eventObject.name);

            if (!namedCollection) {
               namedCollection = this._insertName(eventObject.type, eventObject.name);
            }

            namedCollection.push(eventObject);
            console.log("Communicator - Event: " + eventObject.type + ":" + eventObject.name + " has a new handler.");
         },
         _insertName : function (type, name) {
            if (!this.events.hasOwnProperty(type)) {
               this.events[type] = {};
               console.log("Communicator - Inserted new Event-Type: " + type);
            }
            if (!this.events[type].hasOwnProperty(name)) {
               this.events[type][name] = [];
               console.log("Communicator - Event-Type: " + type + " has a new named handler collection: " + name);
            }

            return this.events[type][name];
         },

         /* ------------------------------------------------------------------------------------------------ */
         /* --------- Removal of Events, Event-Types, Named Handler Collections or specific Handlers ------- */
         /* ------------------------------------------------------------------------------------------------ */
         /**
          * @description Routes to the correct remove-method.
          */
         _remove : function (event) {
            if (this._testIfName(event)) {
               this._removeName(event);
               return;
            }
            if (this._testIfType(event)) {
               this._removeType(event);
               return;
            }
            this._removeEvent(event);
         },
         /**
          * @description Removes event-type.
          */
         _removeType : function (type) {
            if (this.events.hasOwnProperty(type)) {
               console.log("Communicator - Deleted Event-Type: " + type);
            }
            delete this.events[type];
         },
         /**
          * @description Removes all handlers associated with a name from all event-types. Does remove a event-type if its empty.
          */
         _removeName : function (name) {
            var instance = this;
            name = name.substring(1);
            $.each(this.events, function (type, nameList) {
               if (nameList.hasOwnProperty(name)) {
                  console.log("Communicator - Deleted named handler collection " + name + " of the Event-Type: " + type);
               }
               delete nameList[name];
               if (Object.keys(nameList).length === 0) {
                  instance._removeType(type);
               }
            });
         },
         /**
          * @description Removes a specific event (all handlers) type:name, eg. "change:photo". Does remove event-type if its empty.
          */
         _removeEvent : function (event) {
            var typeAndName = this._separateTypeAndName(event),
               type = this._getType(typeAndName[0]),
               name = this._getName(typeAndName[0], typeAndName[1]);
            if (type && name) {
               console.log("Communicator - Deleted named handler collection '" + typeAndName[1] + "' of the Event-Type: " + typeAndName[0]);
            }
            delete this.events[typeAndName[0]][typeAndName[1]];

            if (Object.keys(this.events[typeAndName[0]]).length === 0) {
               this._removeType(typeAndName[0]);
            }

         },
         /**
          * @description Removes a specific handler from a named collection of an event-type. Does remove named collection and event-type if empty.
          */
         _removeHandler : function (event, handler) {
            this._assertIncludesType(event);
            var handlerCollection,
               typeAndName = this._separateTypeAndName(event);
            if (this._testIfType(event)) {
               typeAndName.push("unnamed");
            }
            handlerCollection = this._getName(typeAndName[0], typeAndName[1]);
            if (handlerCollection) {
               this.events[typeAndName[0]][typeAndName[1]] = handlerCollection.filter(function (eventObject) {
                  if (eventObject.handler === handler) {
                     console.log("Communicator - Deleted given handler from event: " + event);
                  }
                  return (eventObject.handler !== handler);
               });
               if (this.events[typeAndName[0]][typeAndName[1]].length === 0) {
                  this._removeEvent(typeAndName.join(":"));
               }
            }
         },
         /* ------------------------------------------------------------------------------------------------ */
         /* ----------------- Execution of Events, Event-Types, Named Handler Collections ------------------ */
         /* ------------------------------------------------------------------------------------------------ */
         /**
          * @description Routes to the correct trigger-method.
          */
         _trigger : function (event, data) {
            console.log("Communicator - trying to trigger: " + event);
            if (this._testIfType(event)) {
               this._triggerType(event, data);
               return;
            }
            if (this._testIfName(event)) {
               this._triggerName(event, data);
               return;
            }
            this._triggerEvent(event, data);
         },
         /**
          * @description Trigger a certain Event-Type. Executes all handlers associated with this type.
          */
         _triggerType : function (type, data) {
            var instance = this;
            if (!this.events.hasOwnProperty(type)) {
               console.log("Communicator - Event-Type: " + type + "doesn't exists.");
               return;
            }
            $.each(this.events[type], function (name, namedCollection) {
               namedCollection.forEach(function (eventObject) {
                  instance._triggerHandler(eventObject, data);
               });
            });
            console.log("Communicator - Successfully triggered Event-Type: " + type);
         },
         /**
          * @description Trigger a certain Event-Name. Executes all handlers associated with this name.
          */
         _triggerName : function (name, data) {
            var instance = this, hasName = false;
            name = name.substring(1);
            $.each(this.events, function (type, nameList) {
               if (nameList.hasOwnProperty(name)) {
                  nameList[name].forEach(function (eventObject) {
                     instance._triggerHandler(eventObject, data);
                  });
                  hasName = true;
               }
            });
            if (!hasName) {
               console.log("Communicator - There is no handler associated with the Event-Name: " + name);
            } else {
               console.log("Communicator - Successfully triggered Event-Name: :" + name);
            }
         },
         /**
          * @description Trigger a certain Event. Executes all handlers associated with this event.
          */
         _triggerEvent : function (event, data) {
            var typeAndName = this._separateTypeAndName(event),
               namedCollection = this._getName(typeAndName[0], typeAndName[1]),
               instance = this;

            if (!namedCollection) {
               console.log("Communicator - Event: " + event + " doesn't exist.");
               return;
            }
            if (namedCollection) {
               namedCollection.forEach(function (eventObject) {
                  instance._triggerHandler(eventObject, data);
               });
               console.log("Communicator - Successfully triggered Event: " + event);
            }
         },
         /**
          * @description Executes an Event-Handler and reduces counter if defined.
          * @param {Object} eventObject A fully valid event-object.
          */
         _triggerHandler : function (eventObject, data) {
            eventObject.handler.call(eventObject.context, data);
            if (eventObject.counter) {
               eventObject.counter--;
               if (eventObject.counter === 0) {
                  this._removeHandler(eventObject.type + ":" + eventObject.name, eventObject.handler);
               }
            }
         },
         /* ------------------------------------------------------------------------------------------------ */
         /* ---------------------------- Retrieval of Event-Types or Named Collections --------------------- */
         /* ------------------------------------------------------------------------------------------------ */
         _getType : function (type) {
            return this.events[type];
         },
         _getName : function (type, name) {
            if (!this.events.hasOwnProperty(type)) {
               return null;
            }
            return this.events[type][name];
         },
         /* ------------------------------------------------------------------------------------------------ */
         /* --------------------------------- Parsing and Creation of Event-Object ------------------------- */
         /* ------------------------------------------------------------------------------------------------ */
         /**
          * @private
          * @description Creates a list of unified Event-Objects.
          */
         _parse : function (events, handler, name, context, counter) {
            var eventList = [],
                instance = this,
                eventOptions = this._extractEventOptions(handler, name, context, counter),
                eventTypes;

            // create eventObject if input is event-string with a single handler: (events, handler[, context][, counter])
            if (typeof events === "string") {
               this._assertEventAndHandler(events, handler); // assert that the event(s) also have a handler
               eventTypes = this._parseEventString(events);
               eventTypes.forEach(function (event) {
                  eventList.push(instance._createEventFromString(event, eventOptions));
               });
            } else if (typeof events === "object") {

               $.each(events, function (event, options) {
                  var eventObject = instance._createEventFromString(event, eventOptions);
                  instance._assertEventAndHandler(options); // asserts that every event has a handler
                  instance._assertEventsInputOptions(options); // asserts that options is either function or object with handler, context and counter
                  // create eventObject if input is ({event-name: event-handler, ...}, context, counter)
                  if (typeof options === "function") {
                     eventObject.handler = options;
                  } else if (typeof options === "object") {
                     //create eventObject if input has specific options defined; overwrites the default options (!) -> subscribe({"change:photo": {handler: f, counter: 2}}, 7); will give the event "change:photo" the counter 2 and not 7
                     $.extend(eventObject, options);
                  }
                  eventList.push(eventObject);
               });
            }

            return eventList;
         },
         _separateTypeAndName : function (event) {
            return event.split(":");
         },
         /**
          * @private
          * @description creates an array out of the given string and asserts validity of events (syntax-wise)
          */
         _parseEventString : function (events) {
            var eventList, instance = this;

            if (this._testIfMultiple(events)) {
               eventList = events.split(" ");
            } else {
               eventList = [events];
            }
            // test if every string is one of: type:name, type, :name
            eventList.forEach(function (event) {
               instance._assertEventSyntax(event);
            });

            return eventList;
         },
         /**
          * @description Creates a basic Event-Object containing all the defined options. Arguments are (if all are defined) :
          * << arg1 = handler ("function"), arg2 = name ("string"), arg3 = context ("object"), arg4 = counter ("number") >>
          */
         _extractEventOptions : function (arg1, arg2, arg3, arg4) {
            // every single of the arguments a different type than all the others
            // therefor we can just check which type each of the arguments has and then assign it the correct usage (handler, name, ...)

            var args = [arg1, arg2, arg3, arg4],
                argsTypes = args.map(function (arg) {
                   return typeof arg;
                }),
                eventObject = {};
            this._assertUniqueness(argsTypes);

            eventObject.handler = args[argsTypes.indexOf("function")] || null;
            // all handlers that have no named collection specified (eg. subscribe("change", handler)) are put into the the unnamed collection of an eventtype
            eventObject.name = args[argsTypes.indexOf("string")] || "unnamed";
            eventObject.context = args[argsTypes.indexOf("object")] || null;
            eventObject.counter = args[argsTypes.indexOf("number")] || null;

            this._assertName(eventObject.name);

            console.log(eventObject);
            return eventObject;
         },
         /**
          * @description Creates a fully valid event-object.
          * @param {String} event Event-Type (and optionally name). Eg. "change:photo", "change"
          * @param {Object} eventOptions Default options for the event. @see _extractEventOptions
          */
         _createEventFromString : function (event, eventOptions) {
            this._assertIncludesType(event);
            var typeAndName = this._separateTypeAndName(event),
                eventObject = $.extend({}, eventOptions);

            eventObject.type = typeAndName[0];
            // overwrite event name in options if event has its own name specified in string (type:name -> "change:photo")
            // if just a type is given "change" the name defined in the event-options is used (if one is specified on subscribe)
            if (typeAndName[1]) {
               eventObject.name = typeAndName[1];
            }

            return eventObject;
         },
         /* ------------------------------------------------------------------------------------------------ */
         /* ---------------------------- Tests and assertions used by Communicator ------------------------- */
         /* ------------------------------------------------------------------------------------------------ */
         _assertEventsInput : function (events) {
            if (typeof events !== "string" && typeof events !== "object") {
               throw new Error("InvalidInputError - Input Parameter Events has to be either string or object");
            }
         },
         _assertEventAndHandler : function (events, handler) {
            var valid;
            if (handler) {
               valid = (typeof events === "string" && typeof handler === "function") ? true : false;
            } else {
               valid = (typeof events === "function" || typeof events.handler === "function") ? true : false;
            }
            if (!valid) {
               throw new Error("InvalidInputError - Event-Type and Handler have to be specified");
            }
         },
         _assertIncludesType : function (event) {
            if (!this._testIfType(event) && !this._testIfTypeAndName(event)) {
               throw new Error("InvalidEventType: " + event);
            }
         },
         _assertEventSyntax : function (event) {
            if (!(this._testIfType(event) || this._testIfTypeAndName(event) || this._testIfName(event))) {
               throw new Error("InvalidEventSyntax: " + event);
            }
         },
         _assertName : function (name) {
            if (!this._testIfName(":" + name)) {
               throw new Error("InvalidNameSyntax: " + name + " - name contains illegal letters - (should be just alphabets when specified separatly)");
            }
         },
         _assertEventsInputOptions : function (options) {
            var valid = true, wrongAttribute, wrongValue;
            if (typeof options !== "function") {
               if (typeof options === "object") {
                  if (options.handler && typeof options.handler !== "function") {
                     valid = false;
                     wrongAttribute = "Handler";
                     wrongValue = options.handler;

                  }
                  if (options.context && typeof options.context !== "object") {
                     valid = false;
                     wrongAttribute = "Context";
                     wrongValue = options.context;
                  }
                  if (options.counter && typeof options.counter !== "number") {
                     valid = false;
                     wrongAttribute = "Counter";
                     wrongValue = options.counter;
                  }
               } else {
                  valid = false;
                  wrongAttribute = "Event-Object";
                  wrongValue = options;
               }
            }
            if (!valid) {
               throw new Error("InvalidInputError - Input: " + wrongAttribute + " Invalid Value: " + wrongValue);
            }
         },
         _assertUniqueness : function (eventArgTypes) {
            var typesSoFar = {};

            eventArgTypes.forEach(function (arg) {
               // ignore undefined cause multiple arguments may be undefined
               if (arg === "undefined") {
                  return;
               }
               if (typesSoFar.hasOwnProperty(arg)) {
                  throw new Error("DuplicatedArgumentType: " + arg);
               }
               typesSoFar[arg] = true;
            });
         },
         _testIfTypeAndName : function (event) {
            return (/^[A-Za-z]+:[A-Za-z]+$/.test(event));
         },
         _testIfType : function (type) {
            return (/^[A-Za-z]+$/.test(type));
         },
         _testIfName : function (name) {
            return (/^:[A-Za-z]+$/.test(name));
         },
         _testIfMultiple : function (events) {
            return (/\s/.test(events));
         },
         /* ------------------------------------------------------------------------------------------------ */
         /* ----------------------- Methods needed for testing this singleton class ------------------------ */
         /* ------------------------------------------------------------------------------------------------ */
         /**
          * @description Removes all events and with that completely resets the singleton.
          */
         clear : function () {
            this.events = {};
         }
      }),

          _instance = new Communicator();
      return _instance;
   });
