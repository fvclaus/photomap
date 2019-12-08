"use strict"

/**
 * @author Marc-Leon Römer
 * @class Provides the logic to present the Album and Place models and to handle all user interaction on the marker
 * @requires Presenter, Communicator
 */

define(["dojo/_base/declare",
  "./ol"],
function (declare, ol) {
  var img = new Image()
  img.src = "/static/images/marker-icons/suitcase2.png"
  img.onload = function () {
    draw(this)
  }

  var regularCanvas = document.createElement("canvas")
  var regularCanvasSize

  var shadowCanvas = document.createElement("canvas")
  var shadowCanvasSize
  // canvas.style.width = "100px"
  // canvas.style.height = "100px"
  var draw = function (img) {
    document.body.appendChild(shadowCanvas)
    shadowCanvasSize = drawShadowCanvas(shadowCanvas)
    document.body.appendChild(regularCanvas)
    regularCanvasSize = drawRegularCanvas(regularCanvas, shadowCanvasSize)
  }

  var horizontalSkew = -0.5
  var shadowMargin = 10
  var imageHeight = 25
  var imageWidth = 25

  var drawShadowCanvas = function (canvas) {
    var ctx = canvas.getContext("2d")
    ctx.save()
    ctx.transform(1, 0, horizontalSkew, 1, 0, 0)
    ctx.shadowColor = "black"
    ctx.shadowBlur = 5
    // Calculate an x so that the bottom left pixel will equal the shadow margin after the transformation matrix is applied.
    // The calculate below solves the following equation: 1 * x + c * y where y =  bottom left pixel = shadowMargin + imageHeight
    //  a c e   x
    //  d d f * y
    //  0 0 1   1
    // a = d = 1 and c = horizontalSkew. (x y) is the bottom left pixel of the image
    ctx.drawImage(img, -1 * horizontalSkew * (shadowMargin + imageHeight) + shadowMargin, shadowMargin, imageWidth, imageHeight)
    // Restore default transformation matrix
    ctx.restore()
    ctx.globalCompositeOperation = "source-in"
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    var imageData = ctx.getImageData(0, 0, (1 + -1 * horizontalSkew) * imageWidth + shadowMargin, imageHeight + 2 * shadowMargin)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.canvas.width = imageData.width
    ctx.canvas.height = imageData.height

    ctx.putImageData(imageData, 0, 0)
    return [imageData.width, imageData.height]
  }

  var drawRegularCanvas = function (canvas, shadowCanvasSize) {
    var ctx = canvas.getContext("2d")
    ctx.drawImage(img, 10, 10, imageWidth, imageHeight)
    var imageData = ctx.getImageData(0, 0, shadowCanvasSize[0], shadowCanvasSize[1])
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.canvas.width = imageData.width
    ctx.canvas.height = imageData.height

    ctx.putImageData(imageData, 0, 0)
    return [imageData.width, imageData.height]
  }

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
      this.map.addFeature(this.marker)
      // map.addMarker(this.marker)

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
      var marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([model.lng, model.lat])),
        name: model.title
      })
      marker.setStyle([
        new ol.style.Style({
          image: new ol.style.Icon({
            img: regularCanvas,
            imgSize: regularCanvasSize
            // About 25x25
            // scale: 0.2
          }),
          zIndex: 1
        }),
        new ol.style.Style({
          image: new ol.style.Icon({
            img: shadowCanvas,
            // About 25x25
            // imgSize: [canvas.style.width, canvas.style.heigth]
            imgSize: shadowCanvasSize
            // scale: 0.2
          }),
          zIndex: 0
        })])
      return marker
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
