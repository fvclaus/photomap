/* jslint */
/* global $, window, define, main, init, initTest, finalizeInit, assertTrue, gettext, CONFIRM_DIALOG */

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
  "../util/ClientState",
  "../model/Photo",
  "../model/Place",
  "../model/Album"
],
function (declare, main, state, communicator, clientstate, Photo, Place, Album) {
  var map = main.getMap()
  var gallery = main.getGallery()
  var slideshow = main.getSlideshow()
  var description = main.getInformation()
  var fullscreen = main.getFullscreen()
  var adminGallery = main.getAdminGallery()
  var pageTitle = main.getPageTitleWidget()
  var controls = main.getControls()
  var dialog = main.getInput()

  return declare(null, {

    constructor: function () {
      communicator.subscribe("clicked:GalleryInsert", this._openPhotoInsertDialog)
      communicator.subscribe("clicked:Map", this._openMarkerInsertDialog)
      communicator.subscribe("clicked:UpdateOperation", this._openModelUpdateDialog)
      communicator.subscribe("clicked:DescriptionInsert", this._openModelUpdateDialog)
      communicator.subscribe("clicked:DeleteOperation", this._openModelDeleteDialog)
      communicator.subscribe("clicked:ShareOperation", this._openAlbumShareDialog)
      communicator.subscribe("changed:PhotoOrder", this._openPhotosUpdateDialog)
    },
    /*
          * --------------------------------------------------
          * Handler:
          * --------------------------------------------------
          */
    _openPhotoInsertDialog: function () {
      var place = map.getOpenedMarker().getModel()
      var photoCollection = place.getPhotos()

      dialog.show({
        load: function () {
          // $("#insert-photo-tabs").tabs();
          dialog.setInputValue("place", place.getId())
          // start the editor
          dialog.startPhotoEditor()
        },
        submit: function (data) {
          var photo = new Photo(data)
          photo
            .onSuccess(function (data) {
              dialog.showResponseMessage(data)
            })
            .onInsert(function () {
              photoCollection.insert(photo)
              communicator.publish("inserted:Model")
            })
            .onFailure(function (data) {
              dialog.showResponseMessage(data)
            })
            .onError(function () {
              // this keyword needs to be dialog
              dialog.showNetworkError()
            })
            .save(data)
        },
        url: "/form/insert/photo",
        isPhotoUpload: true,
        photoInputName: "photo"
      })
    },
    _openMarkerInsertDialog: function (eventData) {
      console.log("Event-Data (should contain lat & lng): ")
      console.log(eventData)
      var markerCollection,
        modelType

      if (state.isDashboardView()) {
        modelType = "Album"
        markerCollection = state.getAlbums()
      } else if (state.isAlbumView()) {
        modelType = "Place"
        markerCollection = state.getAlbum().getPlaces()
      }

      dialog.show({
        load: function () {
          if (modelType === "Place") {
            dialog.setInputValue("album", state.getAlbum().getId())
          }
          dialog.setInputValue("lat", eventData.lat.toFixed(7))
          dialog.setInputValue("lon", eventData.lng.toFixed(7))
        },
        submit: function (data) {
          var marker = modelType === "Place" ? new Place(data) : new Album(data)
          marker
            .onSuccess(function (data) {
              dialog.showResponseMessage(data)
            })
            .onInsert(function () {
              markerCollection.insert(marker)
              communicator.publish("inserted:Model")
            })
            .onFailure(function (data) {
              dialog.showResponseMessage(data)
            })
            .onError(function () {
              // this needs to be dialog
              dialog.showNetworkError()
            })
            .save(data)
        },
        url: "/form/insert/" + modelType.toLowerCase()
      })
    },
    _openModelUpdateDialog: function (model) {
      dialog.show({
        load: function () {
          dialog.setInputValue("title", model.getTitle())
          dialog.setInputValue("description", model.getDescription())
        },
        submit: function (data) {
          model
            .onSuccess(function (data) {
              dialog.showResponseMessage(data)
            })
            .onUpdate(function () {
              communicator.publish("updated:Model", model)
            })
            .onFailure(function (data) {
              dialog.showResponseMessage(data)
            })
            .onError(function () {
              // this needs to be dialog.
              dialog.showNetworkError()
            })
            .save(data)
        },
        url: "/form/update/model"
      })
    },
    _openModelDeleteDialog: function (model) {
      var modelType = model.getType()

      dialog.show({
        load: function () {
          $("#mp-dialog-model-title").text(modelType + " - " + model.getTitle())
        },
        submit: function (data) {
          model
            .onSuccess(function (data) {
              dialog.showResponseMessage(data)
            })
            .onDelete(function () {
              communicator.publish("deleted:Model", model)
            })
            .onFailure(function (data) {
              dialog.showResponseMessage(data)
            })
            .onError(function () {
              // this needs to be dialog
              dialog.showNetworkError()
            })

          model.delete(model, true)
        },
        url: "/form/delete/model"
      })
    },
    _openAlbumShareDialog: function (album) {
      dialog.show({
        load: function () {
          var url = album.getUrl("http://" + window.location.host)
          var $save = $("#mp-dialog-button-save")
          var $url = $("a#album-url")
          $("#mp-open-album-password-form").on("click", function () {
            var $form = $("#mp-album-password-form")
            if ($form.is(":hidden")) {
              $("#mp-album-share-help").stop(true).hide()
              $form.stop(true).slideToggle(100)
            } else {
              $form.stop(true).slideToggle(100)
            }
          })
          $("#mp-open-album-share-help").on("click", function () {
            var $help = $("#mp-album-share-help")
            if ($help.is(":hidden")) {
              $("#mp-album-password-form").stop(true).hide()
              $help.stop(true).slideToggle(100)
            } else {
              $help.stop(true).slideToggle(100)
            }
          })
          $("form[name='update-album-password']").attr("action", "/album/" + album.getId() + "password")
          console.log("AppModelController : " + url)
          $url
            .text(url)
            .attr("href", url)
            .css("cursor", "default")
        },
        submit: function (formData) {
          $.ajax({
            type: "POST",
            dataType: "json",
            data: formData,
            url: "/album/" + album.getId() + "/password",
            success: function (response) {
              dialog.showResponseMessage(response)
            },
            error: function () {
              dialog.showNetworkError()
            }
          })
        },
        width: $(".mp-content").width() * 0.8,
        url: "/form/update/album/password"
      })
    },
    _openPhotosUpdateDialog: function (photos) {
      var instance = this
      dialog.show({
        submit: function () {
          var place = map.getOpenedMarker().getModel()
          $.ajax({
            type: "POST",
            dataType: "json",
            data: {
              photos: JSON.stringify(photos)
            },
            success: function (response) {
              dialog.showResponseMessage(response)
              // update the 'real' photo order
              photos.forEach(function (photo, index) {
                place.getPhotos().get(photo.id).set("order", photo.order)
                console.log("AppModelController: Update order of photo %d successful.", index)
              })

              console.log("AppModelController: All Photos updated. Updating photo widgets.")
              place.getPhotos().sort()

              photos = place.getPhotos().getAll()

              gallery.update(photos)
              slideshow.update(photos)
              adminGallery.refresh()
              slideshow.update(photos)
            },
            error: function () {
              dialog.showNetworkError()
            },
            url: "/photos"
          })
        },
        abort: function () {
          instance.publish("abort:photoOrder")
          // TODO this could be done better
          adminGallery.refresh()
        },
        type: CONFIRM_DIALOG,
        url: "/form/update/photos"
      })
    }
  })
})
