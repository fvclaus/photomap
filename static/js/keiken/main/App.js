"use strict"

var DASHBOARD_VIEW = "/dashboard/"
var ALBUM_VIEW = /album\/\d+\/view/

/**
 * @author Marc-Leon Roemer
 * @class inits the app and fetches the initial data from the server.
 */

define([
  "dojo/_base/declare",
  "../widget/_Widget",
  "../util/Communicator",
  "../model/Collection",
  "../util/ClientState",
  "../model/Album",
  "../widget/QuotaWidget",
  "../widget/PageTitleWidget",
  "./DashboardView",
  "dojo/text!./templates/App.html",
  "../widget/InfoTextWidget",
  "../widget/LoadingScreenWidget"
],
function (declare, _Widget, communicator, Collection, clientstate, Album, QuotaWidget, PageTitleWidget, DashboardView, templateString) {
  return declare(_Widget, {

    viewName: "App",
    templateString: templateString,

    constructor: function () {
      this.isDashboardView = window.location.pathname.search(DASHBOARD_VIEW) !== -1
      this.isAlbumView = !this.isDashboardView
    },

    startup: function () {
      this.inherited(this.startup, arguments)

      if (this.isAlbumView) {
        this.pageTitle.update(gettext("Albumsansicht"))
        this._getPlaces()
      } else {
        this.pageTitle.update("Dashboard")
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
      // get the albums and their info
      $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
          // TODO "get-all-albums" does not return a data.success or data.error
          if ((data && data.success) || (data && !data.success)) {
            this._processInitialData(data)
          } else {
            this.infoText.show({
              message: gettext("GET_ALBUM_ERROR") + data.error
            })
          }
        }.bind(this),
        error: function () {
          this.infoText.show({
            message: gettext("NETWORK_ERROR")
          })
        }.bind(this)
      })
    },
    _processInitialData: function (data) {
      var processedData
      var placeIndex = 0
      var photoIndex = 0
      var place = null
      var photo = null

      if (this.isAlbumView) {
        // Set the visited attribute on every photo.
        for (placeIndex = 0; placeIndex < data.places.length; placeIndex++) {
          place = data.places[placeIndex]
          for (photoIndex = 0; photoIndex < place.photos.length; photoIndex++) {
            photo = place.photos[photoIndex]
            photo.visited = clientstate.isVisitedPhoto(photo)
          }
        }
        processedData = new Album(data)
      } else {
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
      var dashboard = new DashboardView({
        markerModels: processedData,
        isAdmin: isAdmin
      }, this.childNode)
      dashboard.startup()
    }
  })
})
