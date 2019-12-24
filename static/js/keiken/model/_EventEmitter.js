"use strict"

define(["dojo/_base/declare",
  "../util/Communicator"],
function (declare, communicator) {
  return declare(null, {
    EVENTS: ["insert", "update", "delete", "change"],
    constructor: function () {
      assertArray(this.EVENTS)
      assertFunction(this._getEventNs)
      this.EVENTS.forEach(function (eventName) {
        this["on" + eventName[0].toUpperCase() + eventName.slice(1)] = this._onEvent(eventName)
      }.bind(this))
    },
    removeEvents: function (eventNs, events) {
      assertString(eventNs, "Event namespace has to be a string");

      (events || this.EVENTS)
        .forEach(function (eventName) {
          $(this).off(eventName + "." + eventNs)
        }.bind(this))
    },
    _onEvent: function (eventName) {
      return function (handler, thisReference, eventNs) {
        $(this).on(eventName + (eventNs ? "." + eventNs : ""), function () {
          // First argument is event object. Nobody cares about that.
          handler.apply(thisReference || null, Array.prototype.slice.call(arguments, 1))
        })

        return this
      }
    },
    _trigger: function (eventName, data) {
      var event = $.Event(eventName)
      // Prevent JQuery from calling insert()/delete()/... function
      event.preventDefault()
      $(this).trigger(event, data)
      communicator.publish(eventName + ":" + this._getEventNs(), this)

      if (eventName !== "change") {
        communicator.publish("change:" + this._getEventNs(), this)
      }
    }
  })
})
