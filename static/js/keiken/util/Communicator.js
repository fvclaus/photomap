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

"use strict"

/**
 * @author Marc-Leon Roemer
 * @class Mediator for communication between classes. Public methods are: .subscribe(), .subscribeOnce(), .unsubscribe(), .publish()
 */

define(["dojo/_base/declare",
  "./EventConfigurationParser"],
function (declare, EventConfigurationParser) {
  var Communicator = declare(null, {
    constructor: function () {
      this.events = {}
      this.parser = new EventConfigurationParser()
    },
    /**
      * @public
      * @description Subscribe to one or multiple events.
      * @param {String/Object} events May be a String of one or more space-separated event/event-types. May also be an object with one of the following structures:
      * {event1: handler, event2: handler}
      * (!) about (2): all the options given in the event-object will overwrite the "default"-options given as additional parameter to subscribe
      * (eg. subscribe(..., context, counter)) -> it is possible to use the default for some events and specify different options for another in the same .subscribe() call
      * (!) At least 1 event/event-type and 1 handler have to be passed to subscribe. Counter and context are optional and default to null.
      */
    subscribe: function (events, handlerOrName, context) {
      var eventObjectList = this.parser.parse(events, handlerOrName, context)

      eventObjectList.forEach(function (eventObject) {
        eventObject.removeAfterNextInvocation = false
        var registeredEventHandler = (this.events[eventObject.fullName] = this.events[eventObject.fullName] || [])
        registeredEventHandler.push(eventObject)
      }.bind(this))
      return eventObjectList
    },
    subscribeOnce: function (event, handler, context) {
      var eventObjectList = this.subscribe(event, handler, context)
      eventObjectList.forEach(function (eventObject) {
        eventObject.removeAfterNextInvocation = true
      })
    },
    /**
      * @public
      * @description Trigger/publish an event
      * @param {String} name Event-types/names or specific events (=type:name combination). Should have the following structure: "change:photo", "change", ":photo", "change:photo change:place"
      * @param {Object} data Data-Object which is passed to each event-handler
      */
    publish: function (event, data) {
      var registeredEventHandler = this.events[event] || []

      this.events[event] = registeredEventHandler.filter(function (eventObject) {
        eventObject.handler.call(eventObject.context, data)
        return !eventObject.removeAfterNextInvocation
      })
    },
    makePublishFn: function (event, data) {
      return function () {
        this.publish(event, data)
      }
    },
    // This exists, because I don't have arrow functions.
    makeSubscribeFn: function (fn, data) {
      return function () {
        fn(data)
      }
    },
    clear: function () {
      this.events = {}
    }
  })

  var _instance = new Communicator()
  return _instance
})
