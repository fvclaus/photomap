define(["dojo/_base/declare"], function (declare) {
  return declare(null, {
    constructor: function () {
      this.SEPARATOR = ":"
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
          handler: handlerOrName
        })
      } else if (typeof events === "object") {
        if (!this._isValidTypeOrName(handlerOrName)) {
          throw new Error("InvalidEventSyntax: " + handlerOrName)
        }
        return this._parseEventObject(events, {
          name: handlerOrName,
          context: context
        })
      } else {
        throw new Error("InvalidInputError: First parameter must be either event string or event object")
      }
    },
    _parseEventString: function (events, eventOptions) {
      return events.split(" ").map(function (event) {
        var typeAndName = event.split(this.SEPARATOR)
        if (typeAndName.length !== 2) {
          throw new Error("InvalidEventSyntax: " + event)
        } else if (!(this._isValidTypeOrName(typeAndName[0]) && this._isValidTypeOrName(typeAndName[1]))) {
          throw new Error("InvalidEventSyntax: " + event)
        }
        return $.extend(eventOptions, {
          type: typeAndName[0],
          name: typeAndName[1]
        })
      }.bind(this))
    },
    _parseEventObject: function (events, eventOptions) {
      return Object.keys(events).forEach(function (event) {
        if (!this._isValidTypeOrName(event)) {
          throw new Error("InvalidEventSyntax: " + event)
        }
        var handler = events[event]
        if (!(typeof handler === "function")) {
          throw Error("InvalidInputError: Event-Type and Handler have to be specified")
        }
        return $.extend(eventOptions, {
          type: event,
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
