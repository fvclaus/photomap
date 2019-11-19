/* jslint */
/* global $, define, main, window, init, initTest, finalizeInit, assertTrue, gettext */

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
  "../model/Album",
  "../model/Collection",
  "../util/ClientState",
  "../util/InfoText",
  "../util/Tools",
  "./AppStateHelper"
],
function (declare, main, communicator, state, Album, Collection, clientstate, InfoText, tools, appState) {
  var map = main.getMap()
  var gallery = main.getGallery()
  var slideshow = main.getSlideshow()
  var description = main.getInformation()
  var fullscreen = main.getFullscreen()
  var adminGallery = main.getAdminGallery()
  var pageTitle = main.getPageTitleWidget()
  var quota = main.getQuotaWidget()
  var controls = main.getControls()
  var dialog = main.getInput()

  return declare(null, {

    constructor: function () {
      // TODO detail has to be updated when model is deleted or updated -> collections ?!
      var instance = this
      // Instantiate an infotext in case user needs to be informed about sth (use this.infotext.alert(message) for that)
      this.infoText = new InfoText()
      // instantiate attributes that tell the controller whether an event should be ignored
      this.ignoreNextSlideshowUpdate = false
      this.ignoreNextAppStateChange = true

      /* ------------ window events -------------- */
      $(window)
        .on("popstate", function () {
          if (!instance.ignoreNextAppStateChange) {
            var newState = appState.getCurrentState()
            console.log("New AppState:")
            console.log(newState)
            instance._updateState(newState)
          } else {
            instance.ignoreNextAppStateChange = false
          }
        })
      communicator.subscribeOnce("init", function () {
        var $load = $("#mp-loading-screen")
        var hide = function () { $load.hide() }
        $load.find("div:nth-of-type(2)").text("Yay. The app is ready.")
        $load.find("div:nth-of-type(3)").hide()
        $load.find("div:last").show()
        window.setTimeout(hide, 1500)
      })

      /* ----------------------- Model -------------------------- */
      // @see AppModelController
      communicator.subscribe({
        inserted: function () {
          quota.update(clientstate.getUsedSpace(), clientstate.getLimit())
        },
        updated: function (model) {
          quota.update(clientstate.getUsedSpace(), clientstate.getLimit())
          description.update(model)
        },
        deleted: function (model) {
          if (model === this._loadedPlace) {
            slideshow.reset()
            gallery.reset()
            adminGallery.reset()
            fullscreen.reset()
          }
          quota.update(clientstate.getUsedSpace(), clientstate.getLimit())
          description.empty(model)
          this._hideDetail()
        }
      }, "Model", this)

      /* ------------------------- Marker -------------------- */
      communicator.subscribe({
        mouseover: function (marker) {
          if (this._isAdmin === true) {
            controls.show({
              modelInstance: marker.getModel(),
              offset: map.getPositionInPixel(marker),
              dimension: {
                width: marker.getView().getSize().width
              }
            })
          }
        },
        mouseout: function () {
          controls.hideAfterDelay()
        },
        clicked: function (markerPresenter) {
          this._showDetail(markerPresenter.getModel())
          map.updateMarkerStatus(markerPresenter, "select")
          if (markerPresenter.getModel().getType() === "Album") {
            appState.updateAlbum(markerPresenter.getModel().getId())
          } else {
            appState.updateSelectedPlace(markerPresenter.getModel().getId())
          }
        },
        dblClicked: function (markerPresenter) {
          if (markerPresenter.getModel().getType() === "Album") {
            // build url -> format models/model/(id/)request
            window.location.href = "/album/" + markerPresenter.model.getId() + "/view/" + markerPresenter.model.getSecret() + "/"
          } else {
            this._loadedPlace = markerPresenter.getModel()
            this._startPhotoWidgets(markerPresenter.getModel())
            map.updateMarkerStatus(markerPresenter, "open")
            appState.updateOpenedPlace(markerPresenter.getModel().getId())
          }
        }
      }, "Marker", this)

      /* ----------------------- Description  -------------------- */
      communicator.subscribe("closed:Detail", function () {
        map.resetSelectedMarker()
        this._hideDetail()
        appState.updateDescription(null)
      }, this)

      communicator.subscribe("opened:PhotoDetail", function () {
        appState.updateDescription("photo")
      })

      /* ---------- Other non-page-specific events ---------- */
      communicator.subscribeOnce("init", this._init, this)
      communicator.subscribe("activated:View", this._viewActivation)

      /* ------------------ ALBUMVIEW EVENTS --------------------- */
      if (state.isAlbumView()) {
        /* ---------------------- Gallery --------------------------- */
        communicator.subscribe({
          mouseleave: function () {
            controls.hideAfterDelay()
          },
          clicked: function (photo) {
            map.resetSelectedMarker()
            this._hideDetail()
            this._navigateSlideshow(photo)
            appState.updatePhoto(photo.getId())
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
          appState.updatePage(pageIndex)
        })

        communicator.subscribe("clicked:GalleryOpenButton", function () {
          adminGallery.run()
        })

        /* ------------------------ Slideshow ------------------------ */
        communicator.subscribe({
          beforeLoad: function () {
            this._hideDetail()
          },
          updated: function (photo) {
            if (!this.ignoreNextSlideshowUpdate) {
              description.update(photo)
              gallery.navigateTo(photo)
              clientstate.insertVisitedPhoto(photo)
              photo.setVisited(true)
              fullscreen.navigateTo(photo)
              appState.updatePhoto(photo.getId())
            } else {
              this.ignoreNextSlideshowUpdate = false
            }
          }
        }, "Slideshow", this)

        communicator.subscribe("clicked:SlideshowPhoto", function () {
          fullscreen.show()
          appState.updateFullscreen(true)
        })

        /* -------------- Fullscreen ----------------- */
        communicator.subscribe({
          navigated: function (direction) {
            slideshow.navigateWithDirection(direction)
          },
          closed: function () {
            appState.updateFullscreen(false)
          }
        }, "Fullscreen")

        /* --------------- Other Albumview Events ----------------- */
        communicator.subscribe("clicked:PageTitle", function () {
          description.update(state.getAlbum())
          appState.updateDescription("album")
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
      if (state.isAlbumView()) {
        // albumData is a single album
        state.setAlbum(albumData)
        // set initial state -> opened description, and maybe place or even photo
        initialState = appState.setInitialState()
        pageTitle.update(albumData.getTitle())
        this._isAdmin = albumData.isOwner()
        map.startup(albumData, true, albumData.isOwner())
        gallery.startup({ adminMode: albumData.isOwner() })
        this._updateState(initialState, true)
        // Guests should not see the Add description link.
        // TODO This is a hack
        if (this._isAdmin === false) {
          $(".mp-insert-description").remove()
          description.removeAddDescriptionLink()
        }
      } else {
        this._isAdmin = true
        albums = new Collection(albumData, {
          modelType: "Album"
        })
        map.startup(albums, false)
        state.setAlbums(albums)
      }
    },
    _updateState: function (newState, initialCall) {
      // ignore next AppChange - why? some browser trigger popstate after page load and some don't, for those who do the appstate will be initialized and then changed which is not necessary and causes troubles at some occasions..
      this.ignoreNextAppStateChange = initialCall || false
      var album, selectedPlace, openedPlace, photo
      // start with testing if it's dashboard view -> the only possible action is album-selection
      if (state.isDashboardView()) {
        album = state.getAlbums().get(newState.album)
        if (album) {
          map.updateMarkerStatus(album, "select")
        } else if (!newState.album) {
          map.resetSelectedMarker()
        }
        // if not -> albumview -> more actions possible
      } else {
        // get the correct models
        album = state.getAlbum()
        selectedPlace = album.getPlaces().get(newState.selectedPlace)
        openedPlace = album.getPlaces().get(newState.openedPlace)
        if (openedPlace) {
          photo = openedPlace.getPhotos().get(newState.photo)
        }
        // open place if necessary
        if (openedPlace) {
          if (!map.getOpenedMarker() || openedPlace !== map.getOpenedMarker().getModel()) {
            this._startPhotoWidgets(openedPlace)
            map.updateMarkerStatus(openedPlace, "open")
          }
        } else if (newState.openedPlace) {
          this.infoText.alert(gettext("INVALID_OPENED_PLACE"))
        } else {
          map.resetOpenedMarker()
        }
        // load photo if necessary
        if (photo) {
          // ignore next slideshow update to prevent gallery page from being auto navigated, unless (!) it is the initial appstate update
          this.ignoreNextSlideshowUpdate = !initialCall
          this._navigateSlideshow(photo)
        } else if (newState.photo) {
          this.infoText.alert(gettext("INVALID_LOADED_PHOTO"))
        }
        // navigate gallery if necessary
        if (gallery.isValidPage(newState.page)) {
          gallery.navigateTo(newState.page)
        }
        // start fullscreen if necessary
        if (photo && newState.fullscreen) {
          fullscreen.run()
          fullscreen.show()
        } else {
          fullscreen.hide()
        }
        // reset selected place if selectedPlace is undefined
        if (!newState.selectedPlace) {
          map.resetSelectedMarker()
        } else if (selectedPlace) {
          map.updateMarkerStatus(selectedPlace, "select")
        }
      }
      // display the correct description if necessary
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
    },
    _viewActivation: function (viewName) {
      var possibleViews = {
        Slideshow: slideshow,
        Gallery: gallery,
        Fullscreen: fullscreen,
        Map: map,
        Dialog: dialog
      }

      possibleViews[viewName].setActive(true)
      $.each(possibleViews, function (name, view) {
        if (view && name !== viewName) {
          view.setActive(false)
        }
      })
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
      if (!markerModel) {
        return
      }
      description.update(markerModel)

      if (state.isDashboardView()) {
        map.centerMarker(markerModel, -0.25)
        description.slideIn()
      }
    },
    _hideDetail: function () {
      description.closeDetail()
      if (state.isDashboardView()) {
        map.showAll()
      }
    },
    _startPhotoWidgets: function (place) {
      var photos = place.getPhotos()
      description.update(place)
      gallery.load(photos)
      gallery.run()
      slideshow.load(photos)
      adminGallery.load(photos)
      fullscreen.load(photos)
    }
  })
})
