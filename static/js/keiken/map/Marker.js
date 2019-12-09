"use strict"

/**
 * @author Marc-Leon Römer
 * @class Provides the logic to present the Album and Place models and to handle all user interaction on the marker
 * @requires Presenter, Communicator
 */

define(["dojo/_base/declare",
  "./ol",
  "./preloadMarkerIconImages!"],
function (declare, ol, modelToIconImage) {
  var horizontalSkew = -0.3
  var shadowMargin = 4

  return declare(null, {

    ALBUM_SIZE: [25, 25],

    PLACE_ICON_WIDTH: 18,
    PLACE_ICON_HEIGHT: 15,

    PLACE_ICON_SHADOW_WIDTH: 20,
    ALBUM_ICON_SHADOW_WIDTH: 29,

    MODEL_TO_ICON_SIZE: {
      Album: [25, 25]
    },

    STATUS_COLOR: {
      "not-visited": "#3bff5c",
      loaded: "#ff9c3b",
      visited: "#ff453b",
      opened: "#ffe53b"
    },

    constructor: function (map, model) {
      assertTrue(model.getType() === "Place" || model.getType() === "Album", "model has to be either place or album")

      this.opened = false
      this.map = map
      this.model = model

      this.marker = this._makeMarker(model, "not-visited")
      this.map.addFeature(this.marker)

      this.isSingleClick = false // needed to prevent click/dblClick interference
    },
    _makeMarker: function (model, status) {
      var marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([model.lng, model.lat])),
        name: model.title
      })
      marker.setStyle(this._createIconStyles(model, status))
      return marker
    },
    _iconCanvasCache: {},
    _createIconStyles: function (model, status) {
      var shadowCacheKey = model.type + "-shadow"
      var shadowCanvas = this._iconCanvasCache[shadowCacheKey]
      if (!shadowCanvas) {
        shadowCanvas = (this._iconCanvasCache[shadowCacheKey] = this._createShadowIconCanvas(model))
      }

      var iconCacheKey = model.type + "-" + status
      var iconCanvas = this._iconCanvasCache[iconCacheKey]
      if (!iconCanvas) {
        iconCanvas = (this._iconCanvasCache[iconCacheKey] = this._createIconCanvas(model, status, [shadowCanvas.width, shadowCanvas.height]))
      }

      return [new ol.style.Style({
        image: new ol.style.Icon({
          img: iconCanvas,
          imgSize: [iconCanvas.width, iconCanvas.height]
        }),
        zIndex: 1
      }),
      new ol.style.Style({
        image: new ol.style.Icon({
          img: shadowCanvas,
          imgSize: [shadowCanvas.width, shadowCanvas.height]
        }),
        zIndex: 0
      })]
    },
    _findNonEmptyImageData: function (canvas, ctx) {
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      var maxWidth = 0
      var maxHeight = 0
      var numberOfRGBAValuesInRow = 4 * imageData.width
      for (var rowIndex = 0; rowIndex < imageData.height; rowIndex++) {
      // Iterate one row backwards
        for (var columnRGBAIndex = numberOfRGBAValuesInRow; columnRGBAIndex >= 0; columnRGBAIndex--) {
          if (imageData.data[rowIndex * numberOfRGBAValuesInRow + columnRGBAIndex] > 0) {
            var columnIndex = Math.floor(columnRGBAIndex / 4)
            maxWidth = Math.max(maxWidth, columnIndex + 1)
            maxHeight = rowIndex + 1
            break
          }
        }
      }
      return ctx.getImageData(0, 0,
        maxWidth,
        maxHeight)
    },
    _createShadowIconCanvas: function (model) {
      var canvas = document.createElement("canvas")
      var ctx = canvas.getContext("2d")
      var imageWidth = this.MODEL_TO_ICON_SIZE[model.type][0]
      var imageHeight = this.MODEL_TO_ICON_SIZE[model.type][1]
      ctx.save()
      ctx.globalAlpha = 0.2
      ctx.shadowColor = "black"
      ctx.shadowBlur = 4
      // Calculate the x-coordinate of the bottom left pixel that will equal the shadow margin after the transformation matrix is applied.
      // The calculation below solves the following equation: 1 * x + c * y where y = y-coordinate of bottom left pixel = shadowMargin + imageHeight
      //  a c e   x
      //  d d f * y
      //  0 0 1   1
      // a = d = 1 and c = horizontalSkew. (x y) is the bottom left pixel of the image
      // This is required for aligning the two images.
      ctx.fillStyle = "black"
      var x = Math.floor(-1 * horizontalSkew * (shadowMargin + imageHeight) + shadowMargin)
      ctx.transform(1, 0, horizontalSkew, 1, 0, 0)
      ctx.drawImage(modelToIconImage[model.type], x, shadowMargin, imageWidth, imageHeight)
      // Restore default transformation matrix
      ctx.restore()
      ctx.globalCompositeOperation = "source-in"
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      var imageData = this._findNonEmptyImageData(canvas, ctx)
      // var imageData = ctx.getImageData(0, 0, (1 + -1 * horizontalSkew) * imageWidth + shadowMargin, imageHeight + 2 * shadowMargin)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.canvas.width = imageData.width
      ctx.canvas.height = imageData.height

      ctx.putImageData(imageData, 0, 0)
      return canvas
    },
    _createIconCanvas: function (model, status, shadowCanvasSize) {
      var canvas = document.createElement("canvas")
      var ctx = canvas.getContext("2d")
      var imageWidth = this.MODEL_TO_ICON_SIZE[model.type][0]
      var imageHeight = this.MODEL_TO_ICON_SIZE[model.type][1]
      // Should cover the shadow on the left and bottom side.
      ctx.drawImage(modelToIconImage[model.type], shadowMargin - 1, shadowMargin + 1, imageWidth, imageHeight)
      ctx.globalCompositeOperation = "source-in"
      ctx.fillStyle = this.STATUS_COLOR[status]
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      var imageData = ctx.getImageData(0, 0, shadowCanvasSize[0], shadowCanvasSize[1])
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.canvas.width = imageData.width
      ctx.canvas.height = imageData.height

      ctx.putImageData(imageData, 0, 0)
      return canvas
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
