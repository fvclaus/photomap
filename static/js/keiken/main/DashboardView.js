"use strict"

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define([
  "dojo/_base/declare",
  "./Main",
  "../util/Communicator",
  "./UIState",
  "../util/ClientState",
  "../util/InfoText",
  "../util/Tools",
  "./RouterState",
  "../widget/QuotaWidget"
],
function (declare, main, communicator, state, clientstate, InfoText, tools, RouterState, QuotaWidget) {
  // TODO Add listener for keyup event

  var quota = new QuotaWidget($("#mp-user-limit"))

  return declare(null, {

    constructor: function (markerModels) {
      communicator.subscribeOnce("init", function () {
        this.loadingScreen.hide()

        this.isAlbumView = markerModels.modelType === "Album"

        var selectMarker = function (action) {
          return function (modelId) {
            var model = markerModels.get(modelId)
            if (model) {
              map.updateMarkerStatus(model, action)
            } else {
              map.resetMarkerDisplayStatus()
            }
          }
        }
        this.routerState = new RouterState({
          selectedMarker: selectMarker("select"),
          openedMarker: selectMarker("open"),
          fullscreen: function (showFullscreen) {
            if (showFullscreen) {
              fullscreen.run()
              fullscreen.show()
            } else {
              fullscreen.hide()
            }
          },
          page: function (galleryPage) {
            if (gallery.isValidPage(galleryPage)) {
              gallery.navigateTo(galleryPage)
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
        this.routerState.loadState()
      })

      /* ----------------------- Model -------------------------- */
      // @see AppModelController
      communicator.subscribe({
        inserted: function () {
          quota.update()
        },
        updated: function () {
          quota.update()
        },
        deleted: function (model) {
          if (model === this._loadedPlace) {
            slideshow.reset()
            gallery.reset()
            adminGallery.reset()
            fullscreen.reset()
          }
          quota.update()
          this._hideDetail()
        }
      }, "Model", this)

      /* ------------------------- Marker -------------------- */
      communicator.subscribe({
        mouseover: function (marker) {
          if (this._isAdmin) {
            // box is glued under the marker. this looks ugly, but is necessary if multiple markers are close by another
            // offset.top *= 1.01
            this.controls.show({
              modelInstance: marker.getModel(),
              offset: map.getPositionInPixel(marker),
              dimension: {
                width: marker.getView().getSize().width
              }
            })
          }
        },
        mouseout: function () {
          this.controls.hideAfterDelay()
        },
        clicked: function (markerPresenter) {
          var model = markerPresenter.getModel()
          this._showDetail(model)
          this.routerState.update({
            description: model.type,
            selectedMarker: model.id
          })
        },
        dblClicked: function (markerPresenter) {
          var model = markerPresenter.getModel()
          if (this.isAlbumView) {
            window.location.href = "/album/" + model.id + "/view/" + model.secret + "/"
          } else {
            this._loadedPlace = model
            this._startPhotoWidgets(model)
            this.routerState.update({
              openedMarker: model.id,
              page: null
            })
          }
        }
      }, "Marker", this)

      /* ----------------------- Description  -------------------- */
      communicator.subscribe("closed:Detail", function () {
        map.resetMarkerDisplayStatus()
        this._hideDetail()
        this.routerState.update({
          description: null,
          selectedMarker: null,
          openedMarker: null
        })
      }, this)

      communicator.subscribe("opened:PhotoDetail", communicator.makeSubscribeFn(this.routerState.update, {
        description: "photo"
      }))

      communicator.subscribeOnce("init", this._init, this)

      communicator.subscribe({
        mouseleave: function () {
          this.controls.hideAfterDelay()
        },
        clicked: function (photo) {
          this.information.show(photo)
          this._navigateSlideshow(photo)
          this.routerState.update({
            photo: photo.id,
            description: null
          })
        },
        mouseenter: function (data) {
          if (this._isAdmin === true) {
            controls.show({
              modelInstance: data.photo,
              offset: data.element.offset(),
              dimension: {
                width: tools.getRealWidth(data.element)
              }
            })
          }
        }
      }, "GalleryPhoto", this)

      communicator.subscribe("opened:GalleryPage", function (pageIndex) {
        this.routerState.update({
          page: pageIndex
        })
      })

      communicator.subscribe({
        beforeLoad: communicator.makeSubscribeFn(this._hideDetail),
        updated: function (photo) {
          // TODO This might be triggered unnecessarily on startup
          description.show(photo)
          gallery.navigateTo(photo)
          // TODO Why is this not updated in a collection listener?
          clientstate.insertVisitedPhoto(photo)
          photo.setVisited(true)
          appState.update({
            photo: photo.getId(),
            description: false,
            selectedPlace: null
          })
        }
      }, "Slideshow", this)

      communicator.subscribe("clicked:SlideshowPhoto", function (photo) {
        fullscreen.show()
        appState.update({
          fullscreen: true
        })
      })

      /* -------------- Fullscreen ----------------- */
      communicator.subscribe({
        navigated: this.slideshow.navigateWithDirection,
        closed: communicator.makeSubscribeFn(this.routerState.update, {
          fullscreen: false
        })
      }, "Fullscreen")

      if (this.isAlbumView) {
        /* --------------- Other Albumview Events ----------------- */
        <!-- Click on #mp-page-title. What the hell is that? -->
        communicator.subscribe("clicked:PageTitle", function () {
          description.show(this.album)
          appState.update({
            description: "album"
          })
        })
      }
    },
    /*
          * --------------------------------------------------
          * Handler:
          * --------------------------------------------------
          */
    _init: function (albumData) {
      var albums, initialState
      if (this.isAlbumView) {
        // albumData is a single album
        state.setAlbum(albumData)
        // set initial state -> opened description, and maybe place or even photo
        pageTitle.update(albumData.getTitle())
        this._isAdmin = albumData.isOwner()
        map.startup(albumData.getPlaces(), albumData.isOwner(), albumData)
        map.setMapMessage(true, albumData.isOwner())
        gallery.startup({ adminMode: albumData.isOwner() })
      } else {
        this._isAdmin = true
        albums = new Collection(albumData, {
          modelType: "Album"
        })
        map.startup(albums, true)
        map.setMapMessage(false, false)
        state.setAlbums(albums)
      }
    },
    /*
          * @private
          * @param {Photo} photo
          */
    _navigateSlideshow: function (photo) {
      controls.hide()
      slideshow.run()
      slideshow.navigateTo(photo)
    },
    _showDetail: function (markerModel) {
      description.show(markerModel)
    },
    _hideDetail: function () {
      description.hide()
      if (state.isDashboardView()) {
        map.showAll()
      }
    },
    _startPhotoWidgets: function (place) {
      var photos = place.getPhotos()
      description.show(place)
      gallery.load(photos)
      gallery.run()
      slideshow.load(photos)
      adminGallery.load(photos)
      fullscreen.load(photos)
    }
  })
})
