"use strict"

/**
 * @author Marc-Leon Roemer
 * @class Controls communication concerning models (especially IDU-requests)
 */

define([
  "dojo/_base/declare",
  "./Main",
  "./UIState",
  "../util/Communicator",
  "../dialog/ModelDeleteDialog",
  "../dialog/MarkerInsertDialog",
  "../dialog/PhotoInsertDialog",
  "../dialog/AlbumShareDialog",
  "../dialog/ModelUpdateDialog"
],
function (declare, main, state, communicator, ModelDeleteDialog, MarkerInsertDialog, PhotoInsertDialog, AlbumShareDialog, ModelUpdateDialog) {
  var map = main.getMap()

  return declare(null, {

    constructor: function () {
      communicator.subscribe("clicked:GalleryInsert", this._openPhotoInsertDialog.bind(this))
      communicator.subscribe("clicked:Map", this._openMarkerInsertDialog.bind(this))
      communicator.subscribe("clicked:UpdateOperation", this._openModelUpdateDialog.bind(this))
      communicator.subscribe("clicked:DescriptionInsert", this._openModelUpdateDialog.bind(this))
      communicator.subscribe("clicked:DeleteOperation", this._openModelDeleteDialog.bind(this))
      communicator.subscribe("clicked:ShareOperation", this._openAlbumShareDialog.bind(this))
    },
    _openPhotoInsertDialog: function () {
      var place = map.getOpenedMarker().getModel()
      new PhotoInsertDialog().show(place)
    },
    _openMarkerInsertDialog: function (eventData) {
      var dialog = new MarkerInsertDialog()
      var lat = eventData.lat.toFixed(7)
      var lng = eventData.lng.toFixed(7)

      if (state.isDashboardView()) {
        dialog.showAlbum(state.getAlbums(), lat, lng)
      } else if (state.isAlbumView()) {
        dialog.showPlace(state.getAlbum(), lat, lng)
      }
    },
    _openModelUpdateDialog: function (model) {
      new ModelUpdateDialog().show(model)
    },
    _openModelDeleteDialog: function (model) {
      new ModelDeleteDialog().show(model)
    },
    _openAlbumShareDialog: function (album) {
      new AlbumShareDialog().show(album)
    }
  })
})
