"use strict"

/**
 * Album.js
 * @author Frederik Claus
 * @class Models an album that holds places
 */

define(["dojo/_base/declare",
  "./MarkerModel",
  "./Place",
  "./Collection"],
function (declare, MarkerModel, Place, Collection) {
  console.log("Album: start")
  return declare(MarkerModel, {
    constructor: function (data) {
      this.type = "Album"

      if (data) {
        this.owner = (typeof data.isOwner === "boolean") ? data.isOwner : false
        this.secret = data.secret || ""
      }

      var places = []
      var rawPlacesData = (data && data.places) || []
      assertArray(rawPlacesData)
      rawPlacesData.forEach(function (placeData) {
        places.push(new Place(placeData))
      })
      this.places = new Collection(places, {
        modelType: "Place"
      })
    },
    _updateProperties: function (data) {
      // Ignore places property. It can only be changed in the frontend.
      delete data.places
      this.inherited(this._updateProperties, arguments, [data])
    },
    isOwner: function () {
      return this.owner
    },
    getSecret: function () {
      return this.secret
    },
    getPlaces: function () {
      return this.places
    },
    getUrl: function (protocolAndHost) {
      return protocolAndHost + "/album/" + this.getId() + "/view/" + this.getSecret() + "/"
    },
    updatePassword: function (password, errorFn) {
      this._sendRequest(
        {
          url: "/album" + this.id + "/password",
          type: "post",
          data: {
            password: password
          }
        },
        function successFn () {
          this._trigger("update", this)
        }.bind(this),
        errorFn)
      return this
    }
  })
})
