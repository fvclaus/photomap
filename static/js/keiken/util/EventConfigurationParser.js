define(["dojo/_base/declare"], function (declare) {
  return declare(null, {
    constructor: function () {
      this.SEPARATOR = ":"
      this.TYPE_AND_NAME_REGEX = /^[^:]+:[^:]+$/
    },
    /**
      * @description Creates a list of unified Event-Objects.
      */
    parse: function (events, handlerOrName, context) {
      // create eventObject if input is event-string with a single handler: (events, handler[, context][, counter])
      if (typeof events === "string") {
        if (!(typeof handlerOrName === "function")) {
          throw new Error("InvalidInputError: Second parameter must be the handler function")
        }
        return this._parseEventString(events, {
          handler: handlerOrName,
          context: context
        })
      } else if (typeof events === "object") {
        if (!this._isValidTypeOrName(handlerOrName)) {
          throw new Error("InvalidEventSyntax: " + handlerOrName)
        }
        return this._parseEventObject(events, {
          context: context
        }, handlerOrName)
      } else {
        throw new Error("InvalidInputError: First parameter must be either event string or event object")
      }
    },
    _parseEventString: function (event, eventOptions) {
      if (!this.TYPE_AND_NAME_REGEX.test(event)) {
        throw new Error("InvalidEventSyntax: " + event)
      }
      return [$.extend({}, eventOptions, {
        fullName: event
      })]
    },
    _parseEventObject: function (events, eventOptions, name) {
      return Object.keys(events).map(function (event) {
        if (!this._isValidTypeOrName(event)) {
          throw new Error("InvalidEventSyntax: " + event)
        }
        var handler = events[event]
        if (!(typeof handler === "function")) {
          throw Error("InvalidInputError: Event-Type and Handler have to be specified")
        }
        return $.extend({}, eventOptions, {
          fullName: event + ":" + name,
          handler: handler
        })
        // eslint-disable-next-line no-extra-bind
      }.bind(this))
    },
    _isValidTypeOrName: function (typeOrName) {
      return typeOrName && typeOrName.length > 0 && typeOrName.indexOf(this.SEPARATOR) === -1
    }
  })
})
