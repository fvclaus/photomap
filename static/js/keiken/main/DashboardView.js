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
  "./DashboardDialogController",
  "../model/Collection",
  "../util/Tools",
  "dojo/text!./templates/Dashboard.html",
  "../map/MapWidget",
  "../widget/GalleryWidget",
  "../widget/DetailWidget",
  "../widget/ModelOperationWidget",
  "../widget/FullscreenWidget",
  "../widget/InfoTextWidget",
  "../widget/SlideshowWidget"
],
function (declare, _Widget, communicator, clientstate, DashboardDialogController, Collection, tools, templateString) {
  // TODO Add listener for keyup event

  return declare(_Widget, {
    templateString: templateString,
    viewName: "DashboardView",

    constructor: function (params) {
      this.isAdmin = params.isAdmin
      var markerModels = params.markerModels
      this.dialogController = new DashboardDialogController(markerModels)
      this.markerModels = markerModels
      this.isAlbumView = markerModels.constructor !== Collection
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
        mouseover: function (modelPositionDescriptor) {
          // TODO Is this still relevant?
          // box is glued under the marker. this looks ugly, but is necessary if multiple markers are close by another
          // offset.top *= 1.01
          this.controls && this.controls.show(modelPositionDescriptor)
        },
        mouseout: function () {
          this.controls && this.controls.hideAfterDelay()
        },
        clicked: function (model) {
          this._showDetail(model)
        },
        dblClicked: function (model) {
          if (this.isDashboardView) {
            this.goToPath("/album/" + model.id + "/view/" + model.secret + "/")
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
            model: data.photo,
            offset: data.element.offset(),
            dimensions: {
              width: tools.getRealWidth(data.element)
            }
          })
        },
        mouseleave: function () {
          this.controls.hideAfterDelay()
        },
        clicked: function (photo) {
          this.description.show(photo)
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
      }.bind(this))

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
    goToPath: function (path) {
      window.location.href = path
    },
    postCreate: function () {
      this.inherited(this.postCreate, arguments)
      if (this.isAlbumView) {
        this.map.setNoMarkerMessage(this.isAdmin ? "MAP_NO_PLACES_ADMIN" : "MAP_NO_PLACES_GUEST", true)
      } else {
        this.map.setNoMarkerMessage("MAP_NO_ALBUMS", false)
      }
    },
    _navigateSlideshow: function (photo) {
      this.controls.hide()
      this.slideshow.run(photo)
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
      this.description.show(place)
      this.gallery.run(place.photos)
      // TODO This should lazy load
      this.slideshow.load(place.photos)
      this.fullscreen.load(place.photos)
    }
  })
})
