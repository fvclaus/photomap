"use strict"

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define([
  "dojo/_base/declare",
  "../widget/_Widget",
  "./Main",
  "../util/Communicator",
  "./UIState",
  "../util/ClientState",
  "../util/InfoText",
  "./AppStateHelper"
],
function (declare, _Widget, main, communicator, state, clientstate, InfoText, appState) {
  var map = main.getMap()
  var gallery = main.getGallery()
  var description = main.getInformation()
  var pageTitle = main.getPageTitleWidget()
  var quota = main.getQuotaWidget()
  var controls = main.getControls()

  // TODO Add listener for keyup event

  return declare(_Widget, {
    templateString: "",
    constructor: function () {
      this.quota = new QuotaWidget()
      this.controls.startup({ shareOperation: state.isDashboardView() })
      this.information = new DetailView(state.isDashboardView())
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
        this.loadingScreen.hide()
      }.bind(this))

      /* ----------------------- Model -------------------------- */
      // @see AppModelController
      communicator.subscribe({
        inserted: function () {
          quota.update(clientstate.getUsedSpace(), clientstate.getLimit())
        },
        updated: function (model) {
          <!-- TODO: #mp-user-limit .update -->
          quota.update(clientstate.getUsedSpace(), clientstate.getLimit())
        },
        deleted: function (model) {
          quota.update(clientstate.getUsedSpace(), clientstate.getLimit())
          this._hideDetail()
        }
      }, "Model", this)

      /* ------------------------- Marker -------------------- */
      communicator.subscribe({
        mouseover: function (marker) {
          if (this._isAdmin) {
            // box is glued under the marker. this looks ugly, but is necessary if multiple markers are close by another
            // offset.top *= 1.01
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
          appState.updateAlbum(markerPresenter.getModel().getId())
        },
        dblClicked: function (markerPresenter) {
          // build url -> format models/model/(id/)request
          window.location.href = "/album/" + markerPresenter.model.getId() + "/view/" + markerPresenter.model.getSecret() + "/"
        }
      }, "Marker", this)

      /* ----------------------- Description  -------------------- */
      communicator.subscribe("closed:Detail", function () {
        map.resetMarkerDisplayStatus()
        this._hideDetail()
        appState.updateDescription(null)
      }, this)

      /* ---------- Other non-page-specific events ---------- */
      communicator.subscribeOnce("init", this._init, this)
    },
    startup: function () {

    },
    /*
          * --------------------------------------------------
          * Handler:
          * --------------------------------------------------
          */
    _init: function (albumData) {
      var albums

      this._isAdmin = true
      albums = new Collection(albumData, {
        modelType: "Album"
      })
      map.startup(albums, true)
      map.setMapMessage(false, false)
      state.setAlbums(albums)
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
          map.resetMarkerDisplayStatus()
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
          this._startPhotoWidgets(openedPlace)
          map.updateMarkerStatus(openedPlace, "open")
        } else if (newState.openedPlace) {
          this.infoText.alert(gettext("INVALID_OPENED_PLACE"))
        } else {
          map.resetMarkerDisplayStatus()
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
    _showDetail: function (markerModel) {
      if (!markerModel) {
        return
      }

      description.show(markerModel)
    },
    _hideDetail: function () {
      // TODO Animate description box.
      description.hide()
      map.showAll()
    }
  })
})
