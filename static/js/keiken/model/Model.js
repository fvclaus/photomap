"use strict"

/**
 * @author Marc-Leon Römer
 * @class Base class for all models
 */

define(["dojo/_base/declare",
  "./_EventEmitter",
  "./_HttpClient"],
function (declare, _EventEmitter, _HttpClient) {
  return declare([_EventEmitter, _HttpClient], {
    constructor: function (data) {
      if (data) {
        // type will be overwritten by subclass
        this.type = data.type
        this.title = data.title
        if (typeof data.id === "number") {
          this.id = data.id
        } else {
          this.id = -1
        }
        // reading from input elements will return '' if nothing has been entered
        this.description = (data.description === "") ? null : data.description
      };
    },
    /**
          * @description sets any attribute of the model to the
          */
    set: function (name, value) {
      assertFalse(name === "id" || name === "type", "Id or type must be set upon construction.")
      assertTrue(Object.prototype.hasOwnProperty.call(this, name), "Cannot set _builtin properties.")
      this[name] = value
    },
    getTitle: function () {
      return this.title
    },
    setTitle: function (title) {
      this.title = title
    },
    getDescription: function () {
      return this.description
    },
    setDescription: function (description) {
      this.description = description
    },
    /**
          * @public
          * @returns {String} Name of this model
          */
    getType: function () {
      return this.type
    },
    /**
          * @public
          * @returns {Number} Id of this model
          */
    getId: function () {
      return this.id
    },
    equals: function (other) {
      // TODO how does the instanceof check work with Dojo?
      if (other instanceof this.constructor) {
        return other.id === this.id
      } else {
        return false
      }
    },
    delete: function (errorFn) {
      this._sendRequest({
        url: "/" + this.type.toLowerCase() + "/" + this.id + "/",
        type: "DELETE"
      }, function successFn () {
        this._trigger("delete", this)
      },
      errorFn)
    },
    _updateProperties: function (data) {
      $.each(data, function (key, value) {
        this[key] = value
      }.bind(this))
    },
    save: function (newData, errorFn) {
      assertTrue(typeof newData === "object" && newData !== null, "Must provide data to update.")
      this._sendRequest(
        $.extend({
          url: this._buildPostUrl(),
          type: "post",
          data: newData
        }, this._overrideAjaxSettings(newData)),
        function successFn (data) {
          if (this.id > -1) {
            this._updateProperties(newData)
            this._trigger("update", this)
          } else {
          // set id of the new model
            this._updateProperties(data)
            this._trigger("insert", this)
          }
        }.bind(this),
        errorFn)

      return this
    },
    _buildPostUrl: function () {
      return "/" + this.type.toLowerCase() + "/" + (this.id > -1 ? this.id + "/" : "")
    },
    _overrideAjaxSettings: function () {
      return {}
    },
    _getEventNs: function () {
      return this.type
    }
  })
})
