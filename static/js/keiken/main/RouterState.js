
"use strict"

/**
 * @author Marc-Leon Römer
 * @class Provides convenience methods to change or retrieve browser history state. Is restricted to hash-changes.
 * The hash schema is: #/place/id/page/id/photo/id - where page means the current gallery page
 * The ids of place and photo are consecutively set in the backend, the page id is set frontend and starts over in each place
 */

define(["dojo/_base/declare"],
  function (declare) {
    return declare(null, {
      constructor: function (updateStateFns) {
        this.updateStateFns = updateStateFns
        // Safari triggers popstate on pageload. This can cause problems, because the app may not be initialized yet.
        // Create the listener here to avoid too early state updates. In Safari, the app may load the state twice:
        // Once when the init event is triggered and once when the popstate event is triggered. This is not harmful
        // and will be ignored to keep the code simple.
        $(window)
        // Triggered when browser back or forward button was pressed or
        // history.back() or history.forward() was called
          .on("popstate.RouterState", function (evt) {
            var state = evt.originalEvent.state
            this.loadState(state)
          }.bind(this))
      },
      destroy: function () {
        $(window).off("popstate.RouterState")
      },
      loadState: function (state) {
        if (!state) {
          state = this._parseState(window.location.hash)
        }
        $.each(state, function (property, newValue) {
          this.updateStateFns[property](newValue)
        }.bind(this))
      },
      /**
          * @description Can be used to update the current history state and the current hash. Call either .update("place", 5[, options]) or .update({place: 5}[, options])
          * @param {Object} properties May be object ({place: 5, page: 8}) or string ("place") defining the properties that have to be changed
          * @param {Object} newValue Optional. Not needed when properties parameter is an object. Contains new value for the given property.
          * @param {Object} options Possible options are:
          * - "dontUseCurrent" {Boolean} -> If set to True, HashHelper will set a new state (sets all undefined properties to null) instead of using the current state
          * - "replace" {Boolean} -> If set to True, HashHelper will replace the current state in the history instead of pushing a new one
          * - "title" {String} -> Defaults to "". Title for the new history state. (!) Currently ignored by some browsers. (!)
          */
      update: function (newState) {
        var state = Object.assign({}, window.history.state, newState)
        var hash = this._serializeState(state)

        window.history.replaceState(state, "", hash)
      },
      /**
          *
          * @param {String} hash If undefined, parseHash will parse current window hash.
          * @return Returns Object containing information given in the hash.
          */
      _parseState: function (hash) {
        return hash
          .replace("#!", "")
          .split("&")
          .filter(function (keyValue) {
            return !!keyValue
          })
          .reduce(function (state, keyValue) {
            var splitKeyValue = keyValue.split("=")
            state[splitKeyValue[0]] = splitKeyValue[1]
            return state
          }, {})
      },
      _serializeState: function (state) {
        return "#!" +
        Object.keys(state)
          .map(function (key) {
            return key + "=" + state[key]
          })
          .join("&")
      }
    })
  })
