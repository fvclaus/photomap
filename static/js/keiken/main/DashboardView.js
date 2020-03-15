"use strict"

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define([
  "dojo/_base/declare",
  "../widget/_Widget",
  "../util/Communicator",
  "../util/ClientState",
  "../util/Tools",
  "dojo/text!./templates/Dashboard.html",
  "../map/MapWidget",
  "../widget/InfoTextWidget",
  "../widget/SlideshowWidget"
],
function (declare, _Widget, communicator, clientstate, tools, templateString) {
  // TODO Add listener for keyup event

  return declare(_Widget, {
    templateString: templateString,
    viewName: "DashboardView",

    constructor: function (params, srcNodeRef) {
      this._isAdmin = params.isAdmin
      var markerModels = params.markerModels
      this.isAlbumView = markerModels.size() === 1
      this.isDashboardView = !this.isAlbumView
      this.mapMarkerModels = this.isAlbumView ? markerModels.getPlaces() : markerModels
      this.mapFallbackMarkerModel = this.isAlbumView ? markerModels : undefined
    },
    _bindListener: function () {
      communicator.subscribe({
        deleted: function (model) {
          if (model === this._loadedPlace) {
            this.slideshow.reset()
            this.gallery.reset()
            this.fullscreen.reset()
          }
          this._hideDetail()
        }
      }, "Model", this)

      communicator.subscribe({
        mouseover: function (marker) {
          // box is glued under the marker. this looks ugly, but is necessary if multiple markers are close by another
          // offset.top *= 1.01
          this.controls && this.controls.show({
            modelInstance: marker.getModel(),
            offset: this.map.getPositionInPixel(marker),
            dimension: {
              width: marker.getView().getSize().width
            }
          })
        },
        mouseout: function () {
          this.controls.hideAfterDelay()
        },
        clicked: function (markerPresenter) {
          var model = markerPresenter.getModel()
          this._showDetail(model)
        },
        dblClicked: function (markerPresenter) {
          var model = markerPresenter.getModel()
          if (this.isAlbumView) {
            window.location.href = "/album/" + model.id + "/view/" + model.secret + "/"
          } else {
            this._loadedPlace = model
            this._startPhotoWidgets(model)
          }
        }
      }, "Marker", this)

      communicator.subscribe("closed:Detail", function () {
        this.map.resetMarkerDisplayStatus()
        this._hideDetail()
      }, this)

      communicator.subscribe({
        mouseenter: function (data) {
          this.controls && this.controls.show({
            modelInstance: data.photo,
            offset: data.element.offset(),
            dimension: {
              width: tools.getRealWidth(data.element)
            }
          })
        },
        mouseleave: function () {
          this.controls.hideAfterDelay()
        },
        clicked: function (photo) {
          this.information.show(photo)
          this._navigateSlideshow(photo)
        }
      }, "GalleryPhoto", this)

      communicator.subscribe({
        beforeLoad: function () {
          this._hideDetail()
        },
        updated: function (photo) {
          // TODO This might be triggered unnecessarily on startup
          this.description.show(photo)
          this.gallery.navigateTo(photo)
          // TODO Why is this not updated in a collection listener?
          clientstate.insertVisitedPhoto(photo)
          photo.setVisited(true)
        }
      }, "Slideshow", this)

      communicator.subscribe("clicked:SlideshowPhoto", function (photo) {
        this.fullscreen.show(photo)
      })

      communicator.subscribe({
        navigated: function () {
          this.slideshow.navigateWithDirection()
        }
      }, "Fullscreen", this)

      if (this.isAlbumView) {
        communicator.subscribe("clicked:PageTitle", function () {
          this.description.show(this.album)
        })
      }
    },
    _init: function (albumData) {
      if (this.isAlbumView) {
        this.map.startup(albumData.getPlaces(), albumData)
        this.map.setNoMarkerMessage(this._isAdmin ? "MAP_NO_PLACES_ADMIN" : "MAP_NO_PLACES_GUEST", true)
        this.gallery.startup()
      } else {
        this.map.startup(albumData)
        this.map.setNoMarkerMessage("MAP_NO_ALBUMS", false)
      }
    },
    _navigateSlideshow: function (photo) {
      this.controls.hide()
      this.slideshow.run()
      this.slideshow.navigateTo(photo)
    },
    _showDetail: function (markerModel) {
      this.description.show(markerModel)
    },
    _hideDetail: function () {
      this.description.hide()
      if (this.isDashboardView) {
        this.map.showAll()
      }
    },
    _startPhotoWidgets: function (place) {
      var photos = place.getPhotos()
      this.description.show(place)
      this.gallery.load(photos)
      this.gallery.run()
      this.slideshow.load(photos)
      this.fullscreen.load(photos)
    }
  })
})
