"use strict"

/**
 * @author: Frederik Claus
 * @description: Facade for google maps
 */

define([
  "dojo/_base/declare",
  "../widget/_Widget",
  "../util/Communicator",
  "./ol",
  "./Marker",
  "dojo/text!./templates/Map.html",
  "./loadGMaps!"
],
function (declare, _Widget, communicator, ol, Marker, templateString) {
  return declare(_Widget, {
    // Try & error
    ONE_MARKER_DEFAULT_ZOOM_LEVEL: 13,
    viewName: "Map",
    templateString: templateString,
    constructor: function (params) {
      this.options = $.extend({}, {
        draggableCursor: "grab",
        draggingCursor: "grabbing"
      }, this.MAP_OPTIONS, params)
    },
    postCreate: function () {
      this.inherited(this.postCreate, arguments)
      this.markerLayerSource = new ol.source.Vector()
      this.markerLayer = new ol.layer.Vector({
        source: this.markerLayerSource
      })
      this.map = new ol.Map({
        target: this.$map.get(0),
        interactions: ol.interaction.defaults({ doubleClickZoom: false }),
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          this.markerLayer
        ]
      })
    },
    startup: function () {
      if (this._started) {
        return
      }
      this.inherited(this.startup, arguments)
      this.$map.css("cursor", this.options.draggableCursor)
      this.markerModels = this.options.markerModels
      // set array of marker-presenter
      this.markers = this._initMarkers(this.markerModels)

      if (this.markerModels.isEmpty()) {
        this.options.fallbackMarkerModel ? this.showOne(this.options.fallbackMarkerModel) : this.showWorld()
      } else {
        this.showAll()
      }
      var isMapLoaded = false
      this.map.once("postcompose", function () {
        communicator.publish("loaded:Map")
        isMapLoaded = true
      })
      // Map would only render after window resize
      // TODO Maybe there is a better way to do it.
      setTimeout(function () {
        if (!isMapLoaded) {
          this.map.updateSize()
        }
      }.bind(this), 200)
      this.toggleMessage(this.markerModels.isEmpty())
      this._bindCollectionListener()
    },
    /**
      * @public
      * @summary Returns a object containing the absolute bottom and left position of the marker.
      * @param {InfoMarker} element
      * @returns {Object} Containing the bottom and left coordinate as (!!)top(!!) and left attribute
      */
    getPositionInPixel: function (marker) {
      return this.map.getPixelFromCoordinate(marker.getCoordinates())
    },
    fit: function (markersinfo) {
      var view = this.map.getView()
      view.fit(this.markerLayerSource.getExtent())
      if (markersinfo.length < 2) {
        view.setZoom(this.ONE_MARKER_DEFAULT_ZOOM_LEVEL)
      } else {
        view.setZoom(view.getZoom() - 1)
      }
    },
    showWorld: function () {
      var view = this.map.getView()
      view.setZoom(1)
      view.setCenter(ol.proj.fromLonLat([0, 0]))
    },
    toggleMessage: function (noMarker) {
      if (noMarker) {
        this.infotext.show()
      } else {
        this.infotext.hide()
      }
    },
    _bindListener: function () {
      console.log("Binding click listener")
      this.map.on("singleclick", function (event) {
        console.log("Triggered event", event)
        var pixel = this.map.getEventPixel(event.originalEvent)
        var features = this.map.getFeaturesAtPixel(pixel)
        if (features.length) {
          var marker = features[0]._markerInstance
          this.updateMarkerStatus(marker, "select")
          communicator.publish("clicked:Marker", marker.model)
        } else {
          var coordinate = ol.proj.toLonLat(this.map.getEventCoordinate(event.originalEvent))
          communicator.publish("clicked:Map", {
            lat: coordinate[1],
            lng: coordinate[0]
          })
        }
      }.bind(this))

      this.map.on("dblclick", function (event) {
        console.log("Triggered event", event)
        var pixel = this.map.getEventPixel(event.originalEvent)
        var features = this.map.getFeaturesAtPixel(pixel)
        if (features.length) {
          var marker = features[0]._markerInstance
          this._openMarker(marker)
        }
      }.bind(this))

      var currentMarkerOnMouse

      this.map.on("pointermove", function (event) {
        var pixel = this.map.getEventPixel(event.originalEvent)
        var features = this.map.getFeaturesAtPixel(pixel)

        if (features.length && !currentMarkerOnMouse) {
          var marker = features[0]._markerInstance
          currentMarkerOnMouse = marker
          communicator.publish("mouseover:Marker", marker)
        } else if (!features.length && currentMarkerOnMouse) {
          communicator.publish("mouseout:Marker", marker)
          currentMarkerOnMouse = null
        }

        if (features.length) {
          this.$map.css("cursor", "pointer")
        } else {
          this.$map.css("cursor", this.options.draggableCursor)
        }
      }.bind(this))

      this.map.on("pointerdrag", function () {
        this.$map.css("cursor", this.options.draggingCursor)
      }.bind(this))
    },
    updateMarkerStatus: function (markerOrModel, status) {
      assertTrue((status === "select" || status === "open"), "Marker status can just be 'select' or 'open'.")

      // if the given place or album is not a presenter of a marker you have to get its presenter first..
      var marker = (markerOrModel instanceof Marker) ? markerOrModel : this._getMarkerPresenter(markerOrModel)
      this.resetMarkerDisplayStatus()

      status === "select"
        ? marker.displayAsSelected()
        : marker.displayAsOpened()
    },
    resetMarkerDisplayStatus: function () {
      this.markers.forEach(function (marker) {
        marker.displayAsUnselected()
      })
    },
    _getMarkerPresenter: function (model) {
      return this.markers.filter(function (marker) {
        return marker.model === model
      })[0]
    },
    insertMarker: function (model, init) {
      var marker = new Marker(model)
      this.markerLayerSource.addFeature(marker.marker)

      // TODO This does not belong here. AppController probably.
      if (!init) {
        this.toggleMessage(false)
        this._openMarker()
      }

      return marker
    },
    _openMarker: function (marker) {
      this.updateMarkerStatus(marker, "open")
      communicator.publish("dblClicked:Marker", marker.model)
    },
    _initMarkers: function (models) {
      return models.map(function (model) {
        return this.insertMarker(model, true)
      }.bind(this))
    },
    showAll: function () {
      this.fit(this.markerModels.getAll())
    },
    showOne: function (markerModel) {
      var view = this.map.getView()
      view.setCenter(ol.proj.fromLonLat([markerModel.lng, markerModel.lat]))
      view.setZoom(this.ONE_MARKER_DEFAULT_ZOOM_LEVEL)
    },
    setNoMarkerMessage: function (i18nKey, hideOnMouseover) {
      if (this.markerModels.isEmpty()) {
        this.infotext.show({
          message: gettext(i18nKey),
          hideOnMouseover: hideOnMouseover
        })
      }
    },
    _bindCollectionListener: function () {
      this.markerModels
        .onDelete(function (model) {
          var marker = this._getMarkerPresenter(model)
          this.markerLayerSource.removeFeature(marker.marker)
          this.markers.splice(this.markers.indexOf(marker), 1)
        }, this, "Map")
        .onInsert(function (model) {
          this.insertMarker(model)
        }, this, "Map")
    }
  })
})
