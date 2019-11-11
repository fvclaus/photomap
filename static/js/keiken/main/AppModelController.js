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
      communicator.subscribe("clicked:GalleryInsert", this._openPhotoInsertDialog)
      communicator.subscribe("clicked:Map", this._openMarkerInsertDialog)
      communicator.subscribe("clicked:UpdateOperation", this._openModelUpdateDialog)
      communicator.subscribe("clicked:DescriptionInsert", this._openModelUpdateDialog)
      communicator.subscribe("clicked:DeleteOperation", this._openModelDeleteDialog)
      communicator.subscribe("clicked:ShareOperation", this._openAlbumShareDialog)
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
