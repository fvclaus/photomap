/* jslint */
/* global $, define, window, init, initTest, finalizeInit, assertTrue, gettext */

"use strict"

/**
 * @author Marc-Leon Roemer
 * @class inits the app and fetches the initial data from the server.
 */

define([
  "dojo/_base/declare",
  "./Main",
  "./AppController",
  "./AppModelController",
  "../util/Communicator",
  "./UIState",
  "../util/Collection",
  "../util/ClientState",
  "../model/Album",
  "../util/InfoText",
  "../widget/QuotaWidget",
  "../widget/PageTitleWidget"
],
function (declare, main, AppController, AppModelController, communicator, state, Collection, clientstate, Album, InfoText, QuotaWidget, PageTitleWidget) {
  return declare(null, {

    start: function () {
      console.log("AppInitializer started")
      assertTrue(state.isAlbumView() || state.isDashboardView(), "current view has to be either albumview or dashboardview")

      var appController = new AppController()
      var appModelController = new AppModelController()

      if (state.isAlbumView()) {
        this._getPlaces()
      } else {
        this._getAlbums()
      }
    },
    postCreate: function () {
      this.quota = new QuotaWidget(null, $("#mp-user-limit"))
      this.pageTitle = new PageTitleWidget(null, $("#mp-page-title"))
    },
    _bindListener: function () {
      communicator.subscribe({
        inserted: function () {
          this.quota.update()
        },
        updated: function () {
          this.quota.update()
        },
        deleted: function () {
          this.quota.update()
        }
      }, "Model", this)
    },
    /**
          * @private
          */
    _getAlbums: function () {
      this._getInitialData("/albums")
    },
    /**
          * @private
          */
    _getPlaces: function () {
      var idFromUrl = /\/(\d+)\//
      var id = idFromUrl.exec(window.location.pathname)[1]

      this._getInitialData("/album/" + id + "/")
    },
    /**
          * @private
          */
    _getInitialData: function (url) {
      var instance = this
      var info = new InfoText()
      // get the albums and their info
      $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
          // TODO "get-all-albums" does not return a data.success or data.error
          if ((data && data.success) || (data && !data.success)) {
            instance._processInitialData(data)
          } else {
            info.alert(gettext("GET_ALBUM_ERROR") + data.error)
          }
        },
        error: function () {
          info.alert(gettext("NETWORK_ERROR"))
        }
      })
    },
    _processInitialData: function (data) {
      assertTrue(state.isAlbumView() || state.isDashboardView(), "current view has to be either albumview or dashboardview")

      var processedData
      var placeIndex = 0
      var photoIndex = 0
      var place = null
      var photo = null

      if (state.isAlbumView()) {
        // Set the visited attribute on every photo.
        for (placeIndex = 0; placeIndex < data.places.length; placeIndex++) {
          place = data.places[placeIndex]
          for (photoIndex = 0; photoIndex < place.photos.length; photoIndex++) {
            photo = place.photos[photoIndex]
            photo.visited = clientstate.isVisitedPhoto(photo)
          }
        }
        processedData = new Album(data)
      } else if (state.isDashboardView()) {
        processedData = []

        $.each(data, function (index, albumData) {
          processedData.push(new Album(albumData))
        })
      }
      console.dir(processedData)
      var isAdmin
      if (this.isAlbumView) {
        isAdmin = processedData.isOwner()
        this.pageTitle.update(processedData.getTitle())
      } else {
        isAdmin = true
        processedData = new Collection(processedData, {
          modelType: "Album"
        })
      }
      this.loadingScreen.hide()
      this.loadingScreen.destroy()
      this.dashboard = new DashboardView({
        markerModels: processedData,
        isAdmin: isAdmin
      })
    }
  })
})
