"use strict"

define([
  "dojo/_base/declare",
  "./Presenter",
  "../utils/Communicator",
  "../view/MarkerView"
],
function (declare, Presenter, communicator, MarkerView) {
  return declare(Presenter, {
    constructor: function () {
      this.markerModelCollection = null
      this.markerPresenter = null
      this.selectedMarker = null
      this.openedMarker = null
    },

    startup: function (markerModelCollection, admin, fallbackMarker) {
      this.markerModelCollection = markerModelCollection
      if (admin) {
        this.view.bindClickListener()
      }
      // set array of marker-presenter
      this.markerPresenter = this._initMarkers(this.markerModelCollection)

      if (this.markerModelCollection.isEmpty()) {
        fallbackMarker ? this.showOne(fallbackMarker) : this.showWorld()
      } else {
        this.showAll()
      }
      this.view.toggleMessage(this.markerModelCollection.isEmpty())
      this._bindCollectionListener()
    },
    getPositionInPixel: function (element) {
      return this.view.getPositionInPixel(element)
    },
    updateMarkerStatus: function (presenterOrModel, status) {
      assertTrue((status === "select" || status === "open"), "Marker status can just be 'select' or 'open'.")

      // if the given place or album is not a presenter of a marker you have to get its presenter first..
      var marker = (presenterOrModel instanceof Presenter) ? presenterOrModel : this._getMarkerPresenter(presenterOrModel)
      this.resetMarkerDisplayStatus()

      if (status === "select") {
        marker.displayAsSelected()
      } else {
        marker.displayAsOpened()
      }
    },
    resetMarkerDisplayStatus: function () {
      this.markerPresenter.forEach(function (marker) {
        marker.displayAsUnselected()
      })
    },
    _getMarkerPresenter: function (model) {
      return this.markerPresenter.filter(function (markerPresenter) {
        return markerPresenter.model === model
      })[0]
    },
    insertMarker: function (model, init) {
      var markerView = new MarkerView(this.view, Marker.createMarker(model), model)
      var marker = markerView.getPresenter()

      marker
        .addListener("mouseover", communicator.makePublishFn("mouseover:Marker", marker))
        .addListener("mouseout", communicator.makePublishFn("mouseout:Marker", marker))
        .addListener("dblclick", this._openMarker)
        .addListener("click", function () {
          this.updateMarkerStatus(marker, "select")
          communicator.publish("clicked:Marker", marker)
        }.bind(this))

      marker
        .show()
        .displayAsUnselected()

      // TODO This does not belong here. AppController probably.
      if (!init) {
        this.view.toggleMessage(false)
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
      this.view.fit(this.markerModelCollection.getAll())
    },
    showWorld: function () {
      this.view.showWorld()
    },
    showOne: function (markerModel) {
      this.view.fit([markerModel])
    },
    /* ----------------------------------- */
    /* --------- private methods --------- */
    setMapMessage: function (albumview, admin) {
      if (!albumview) {
        this.view.setMessage(gettext("MAP_NO_ALBUMS"), {
          hideOnMouseover: false,
          hideOnClick: true,
          openOnMouseleave: true
        })
      } else {
        if (admin) {
          this.view.setMessage(gettext("MAP_NO_PLACES_ADMIN"))
        } else {
          this.view.setMessage(gettext("MAP_NO_PLACES_GUEST"))
        }
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
