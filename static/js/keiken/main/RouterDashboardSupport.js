"use strict"

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define([
  "dojo/_base/declare",
  "../util/Communicator",
  "./RouterState"
],
function (declare, communicator, RouterState) {
  // TODO Add listener for keyup event

  return declare(null, {

    constructor: function (params, srcNodeRef) {
      var markerModels = params.markerModels
      this.isAlbumView = markerModels.modelType === "Album"
      this.isDashboardView = !this.isAlbumView

      var selectMarker = function (action) {
        return function (modelId) {
          var model = markerModels.get(modelId)
          if (model) {
            this.map.updateMarkerStatus(model, action)
          } else {
            this.map.resetMarkerDisplayStatus()
          }
        }
      }
      this.routerState = new RouterState({
        selectedMarker: selectMarker("select"),
        openedMarker: selectMarker("open"),
        fullscreen: function (showFullscreen) {
          if (showFullscreen) {
            this.fullscreen.run()
            this.fullscreen.show()
          } else {
            this.fullscreen.hide()
          }
        },
        page: function (galleryPage) {
          if (this.gallery.isValidPage(galleryPage)) {
            this.gallery.navigateTo(galleryPage)
          }
        },
        photo: function (photoId) {
          if (photoId) {
            // ignore next slideshow update to prevent gallery page from being auto navigated, unless (!) it is the initial appstate update
            this.ignoreNextSlideshowUpdate = !initialCall
            this._navigateSlideshow(photo)
          }
        },
        description: function (description) {
          switch (newState.description) {
            case "album":
              this._showDetail(album)
              break
            case "place":
              this._showDetail(selectedPlace)
              break
            case "photo":
              this._showDetail(photo)
              break
            default:
              this._hideDetail()
              break
          }
        }
      })
    },
    postCreate: function () {
      this.routerState.loadState()
    },
    _bindListener: function () {
      var routerState = this.routerState

      var updateState = function (event, dataOrFn) {
        communicator.subscribe(event, typeof dataOrFn === "function"
          ? function () {
            routerState.update(dataOrFn.apply(null, arguments))
          }
          : function () {
            routerState.update(dataOrFn)
          })
      }
      /* ------------------------- Marker -------------------- */
      updateState("clicked:Marker", function (markerPresenter) {
        var model = markerPresenter.getModel()
        return {
          description: model.type,
          selectedMarker: model.id
        }
      })
      updateState("dblClicked:Marker", function (markerPresenter) {
        if (this.isDashboardView) {
          var model = markerPresenter.getModel()
          this.routerState.update({
            openedMarker: model.id,
            page: null
          })
        }
      })

      updateState("closed:Detail", {
        description: null,
        selectedMarker: null,
        openedMarker: null
      })

      updateState("opened:PhotoDetail", {
        description: "photo"
      })

      updateState("clicked:GalleryPhoto", function (photo) {
        return {
          photo: photo.id,
          description: null
        }
      })

      updateState("opened:GalleryPage", function (pageIndex) {
        return {
          page: pageIndex
        }
      })

      updateState("update:Slideshow", function (photo) {
        return {
          photo: photo.getId(),
          description: false,
          selectedPlace: null
        }
      })

      updateState("opened:Fullscreen", {
        fullscreen: true
      })

      updateState("closed:Fullscreen", {
        fullscreen: false
      })

      if (this.isAlbumView) {
        updateState("clicked:PageTitle", {
          desription: "album"
        })
      }
    }
  })
})
