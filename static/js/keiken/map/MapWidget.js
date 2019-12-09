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
  "dojo/text!./templates/Map.html"
  // "./loadGMaps!"
  // "./loadGMaps!"
],
function (declare, _Widget, communicator, ol, Marker, templateString) {
  return declare(_Widget, {
    ZOOM_OUT_LEVEL: 3,
    // MAP_OPTIONS: {
    //   mapTypeId: google.maps.MapTypeId.ROADMAP,
    //   mapTypeControl: true,
    //   mapTypeControlOptions: {
    //     style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
    //     position: google.maps.ControlPosition.TOP_LEFT
    //   },
    //   panControl: true,
    //   panControlOptions: {
    //     position: google.maps.ControlPosition.TOP_LEFT
    //   },
    //   zoomControl: true,
    //   zoomControlOptions: {
    //     style: google.maps.ZoomControlStyle.SMALL,
    //     position: google.maps.ControlPosition.TOP_LEFT
    //   },
    //   streetViewControl: true,
    //   streetViewControlOptions: {
    //     position: google.maps.ControlPosition.TOP_LEFT
    //   },
    //   disableDoubleClickZoom: true
    // },
    viewName: "Map",
    templateString: templateString,
    constructor: function (params) {
      // this.$mapEl.data({
      //   originalWidth: this.$mapEl.width(),
      //   originalHeight: this.$mapEl.height()
      // })
      this.options = $.extend({}, {
        isAdmin: false,
        draggableCursor: "crosshair",
        draggingCursor: "move"
      }, this.MAP_OPTIONS, params)
    },
    postCreate: function () {
      this.inherited(this.postCreate, arguments)
      this.markerSource = new ol.source.Vector()
      this.map = new ol.Map({
        target: this.$map.get(0),
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          new ol.layer.Vector({
            source: this.markerSource
          })
        ]
      })
      // define overlay to retrieve pixel position on mouseover event
      // this.overlay = new google.maps.OverlayView()
      // this.overlay.draw = function () {}
      // this.overlay.setMap(this.map)
    },
    startup: function (markerModelCollection, fallbackMarker) {
      this.markerModelCollection = markerModelCollection
      if (this.options.isAdmin) {
        this.bindClickListener()
      }
      // set array of marker-presenter
      this.marker = this._initMarkers(this.markerModelCollection)

      if (this.markerModelCollection.isEmpty()) {
        fallbackMarker ? this.showOne(fallbackMarker) : this.showWorld()
      } else {
        this.showAll()
      }
      this.toggleMessage(this.markerModelCollection.isEmpty())
      this._bindCollectionListener()
    },
    /**
      * @public
      * @summary Returns a object containing the absolute bottom and left position of the marker.
      * @param {InfoMarker} element
      * @returns {Object} Containing the bottom and left coordinate as (!!)top(!!) and left attribute
      */
    getPositionInPixel: function (element) {
      var pixel = this.overlay.getProjection().fromLatLngToContainerPixel(element.getLatLng())
      var offset = this.$map.offset()
      return {
        top: pixel.y + offset.top,
        left: pixel.x + offset.left
      }
    },
    _setZoom: function (level) {
      var zoomListener = google.maps.event.addListener(this.map, "tilesloaded", function () {
        this.map.setZoom(level)
        google.maps.event.removeListener(zoomListener)
      }.bind(this))
    },
    fit: function (markersinfo) {
      // fit these bounds to the map

      // var view = new ol.View({
      //   center: new ol.geom.MultiPoint(
      //     markersinfo.map(function (marker) {
      //       return [marker.lat, marker.lng]
      //     })
      //   ),
      //   zoom: 4
      // })
      var view = this.map.getView()
      view.fit(this.markerSource.getExtent())
      // this.map.fitBounds(markersinfo.reduce(function (bounds, marker) {
      //   bounds.extend(new google.maps.LatLng(marker.lat, marker.lng))
      //   return bounds
      // }, new google.maps.LatLngBounds()))
      //
      // view.setZoom(4)
      view.setZoom(view.getZoom() - 1)
      if (markersinfo.length < 2) {
      }
    },
    showWorld: function () {
      // TODO Wrap all methods in initialization fn.
      var initialize = function () {
        this.map.fitBounds(
          new google.maps.LatLngBounds(
            new google.maps.LatLng(-37, -92),
            new google.maps.LatLng(61, 60)))
      }.bind(this)

      google.maps.event.addDomListener(window, "load", initialize)
    },
    toggleMessage: function (noMarker) {
      if (noMarker) {
        this.infotext.show()
      } else {
        this.infotext.hide()
      }
    },
    bindClickListener: function () {
      google.maps.event.addListener(this.map, "click", function (event) {
        communicator.publish("clicked:Map", {
          lat: parseFloat(event.latLng.lat()),
          lng: parseFloat(event.latLng.lng())
        })
      })
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
      this.marker.forEach(function (marker) {
        marker.displayAsUnselected()
      })
    },
    _getMarkerPresenter: function (model) {
      return this.marker.filter(function (marker) {
        return marker.model === model
      })[0]
    },
    insertMarker: function (model, init) {
      var marker = new Marker(this.markerSource, model)

      // marker
      //   .addListener("mouseover", communicator.makePublishFn("mouseover:Marker", marker))
      //   .addListener("mouseout", communicator.makePublishFn("mouseout:Marker", marker))
      //   .addListener("dblclick", this._openMarker)
      //   .addListener("click", function () {
      //     this.updateMarkerStatus(marker, "select")
      //     communicator.publish("clicked:Marker", marker)
      //   }.bind(this))

      // TODO This does not belong here. AppController probably.
      if (!init) {
        this.toggleMessage(false)
        this._openMarker()
      }

      return marker
    },
    _openMarker: function (marker) {
      this.updateMarkerStatus(marker, "open")
      communicator.publish("dblClicked:Marker", marker)
    },
    _initMarkers: function (models) {
      return models.map(function (model) {
        return this.insertMarker(model, true)
      }.bind(this))
    },
    showAll: function () {
      this.fit(this.markerModelCollection.getAll())
    },
    showOne: function (markerModel) {
      this.fit([markerModel])
    },
    /* ----------------------------------- */
    /* --------- private methods --------- */
    setMapMessage: function (albumview, admin) {
      if (!albumview) {
        this.infotext.show({
          message: gettext("MAP_NO_ALBUMS"),
          hideOnMouseover: false
        })
      } else {
        this.infotext.show({
          message: admin ? gettext("MAP_NO_PLACES_ADMIN")
            : gettext("MAP_NO_PLACES_GUEST")
        })
      }
    },
    _bindCollectionListener: function () {
      this.markerModelCollection
        .onDelete(function (model) {
          this._getMarkerPresenter(model).hide()
        }, this, "Map")
        .onInsert(function (model) {
          this.insertMarker(model)
        }, this, "Map")
    }
  })
})
