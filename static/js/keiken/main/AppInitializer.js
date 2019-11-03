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
  "../util/ClientState",
  "../model/Album",
  "../util/InfoText"
],
function (declare, main, AppController, AppModelController, communicator, state, clientstate, Album, InfoText) {
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
      var processedData
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
      communicator.publish("init", processedData)
    }
  })
})
