"use strict"

/**
 * @author Marc-Leon Römer
 * @class Provides the logic to present the Album and Place models and to handle all user interaction on the marker
 * @requires Presenter, Communicator
 */

define(["dojo/_base/declare"],
  function (declare) {
    return declare(null, {

      ALBUM_ICON_WIDTH: 25,
      ALBUM_ICON_HEIGHT: 25,

      PLACE_ICON_WIDTH: 18,
      PLACE_ICON_HEIGHT: 15,

      PLACE_ICON_SHADOW_WIDTH: 20,
      ALBUM_ICON_SHADOW_WIDTH: 29,

      constructor: function (map, model) {
        assertTrue(model.getType() === "Place" || model.getType() === "Album", "model has to be either place or album")

        this.opened = false
        this.map = map
        this.model = model

        // this._iconSize = this.model.type === "Album"
        //   ? new google.maps.Size(this.ALBUM_ICON_WIDTH, this.ALBUM_ICON_HEIGHT, "px", "px")
        //   : new google.maps.Size(this.PLACE_ICON_WIDTH, this.PLACE_ICON_HEIGHT, "px", "px")

        this.marker = this._makeOSMMarker(model)
        map.addMarker(this.marker)

        this.isSingleClick = false // needed to prevent click/dblClick interference
      },
      _makeMarker: function (model) {
        var shadowWidth = this.model.type === "Place" ? this.PLACE_ICON_SHADOW_WIDTH : this.ALBUM_ICON_SHADOW_WIDTH
        return new google.maps.Marker({
          position: this.getLatLng(),
          map: this.map,
          icon: this._makeIcon("not-visited"),
          shadow: {
            url: this._makeMarkerIconPath("shadow"),
            anchor: new google.maps.Point(shadowWidth - this._iconSize.width, this._iconSize.height),
            scaledSize: new google.maps.Size(shadowWidth, this._iconSize.height, "px", "px")
          },
          title: model.title
        })
      },
      _makeOSMMarker: function (model) {
        return new OpenLayers.LonLat(model.lng, model.lat)
      },
      _makeMarkerIconPath: function (status) {
        return "/static/images/marker-icons/" +
          (this.model.type === "Album" ? "suitcase" : "camera") +
          "-" + status +
          ".png"
      },
      show: function () {
        this.marker.setVisible(true)
        return this
      },
      hide: function () {
        this.marker.setVisible(false)
        return this
      },
      displayAsSelected: function () {
        this._showIcon("current")
        return this
      },
      displayAsOpened: function () {
        this._showIcon("loaded")
        return this
      },
      displayAsUnselected: function () {
        if (this.model.getType() === "Place" && this.model.isVisited()) {
          this._showIcon("visited")
        } else {
          this._showIcon("not-visited")
        }
        return this
      },
      getLatLng: function () {
        return new google.maps.LatLng(this.model.lat, this.model.lng)
      },
      addListener: function (event, callback) {
        google.maps.event.addListener(this.marker, event, function (eventObject) {
          if (eventObject.type === "click") {
            this.isSingleClick = true
            window.setTimeout(function () {
              if (this.isSingleClick) {
                this.isSingleClick = false
                callback(eventObject)
              }
            }.bind(this), 800)
          } else if (eventObject.type === "dblclick") {
            this.isSingleClick = false
            callback(eventObject)
          } else {
            callback(eventObject)
          }
        }.bind(this))
        return this
      },
      triggerEvent: function (event) {
        google.maps.event.trigger(this.marker, event)
      },
      _showIcon: function (status) {
        this.marker.setIcon(this._makeIcon(status))
      },
      _makeIcon: function (status) {
        return new google.maps.MarkerImage(
          this._makeMarkerIconPath(status),
          undefined,
          undefined,
          undefined,
          this._iconSize)
      }
    })
  })
