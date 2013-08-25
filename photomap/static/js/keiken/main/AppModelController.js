/*jslint */
/*global $, define, main, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class Controls communication concerning models (especially IDU-requests)
 */

define(["dojo/_base/declare",
        "../util/Communicator",
        "../ui/UIState",
        "../util/ClientState"],
   function (declare, communicator, state, clientstate) {
      return declare(null, {
         
         constructor : function () {
            
            communicator.subscribe("click:GalleryInsert", this._openPhotoInsertDialog);
            communicator.subscribe("click:Map", this._openMarkerInsertDialog);
            communicator.subscribe("clicked:UpdateOperation", this._openModelUpdateDialog);
            communicator.subscribe("clicked:DeleteOperation", this._openModelDeleteDialog);
            communicator.subscribe("clicked:ShareOperation", this._openAlbumShareDialog);
            communicator.subscribe("change:photoOrder", this._openPhotosUpdateDialog);
         },
         /*
          * --------------------------------------------------
          * Handler: 
          * --------------------------------------------------
          */
         _openPhotoInsertDialog : function () {
            var place = main.getMap().getOpenedMarker().getModel(),
                photoCollection = place.getPhotos(),
                dialog = main.getUI().getDialog();
            
            dialog.show({
               load : function () {
                  $("#insert-photo-tabs").tabs();
                  dialog.setInputValue("place", place.getId());
                  //start the editor
                  dialog.startPhotoEditor();
               },
               submit: function (data) {
                  photoCollection
                     .onSuccess(function (data) {
                        dialog.showResponseMessage(data);
                        clientstate.updateUsedSpace();
                     })
                     .onFailure(function (data) {
                        dialog.showResponseMessage(data);
                     })
                     .onError(dialog.showNetworkError)
                     .insertRaw(data);
               },
               url : "/form/insert/photo",
               isPhotoUpload: true,
               photoInputName: "photo"
            });
         },
         _openMarkerInsertDialog : function (eventData) {
            console.log("Event-Data (should contain lat & lng): ");
            console.log(eventData);
            var dialog = main.getUI().getDialog(),
                markerCollection,
                modelType;
            
            if (state.isDashboardView()) {
               modelType = "Album";
               markerCollection = state.getAlbums();
            } else if (state.isAlbumView()) {
               modelType = "Place";
               markerCollection = state.getAlbum().getPlaces();
            }
            
            dialog.show({
               load : function () {
                  if (modelType === "Place") {
                     dialog.setInputValue("album", state.getAlbum().getId());
                  }
                  dialog.setInputValue("lat", eventData.lat);
                  dialog.setInputValue("lon", eventData.lng);
               },
               submit: function (data) {
                  markerCollection
                     .onSuccess(function (data) {
                        dialog.showResponseMessage(data);
                        clientstate.updateUsedSpace();
                     })
                     .onFailure(function (data) {
                        dialog.showResponseMessage(data);
                     })
                     .onError(dialog.showNetworkError)
                     .insertRaw(data);
               },
               url : "/form/insert/" + modelType.toLowerCase()
            });
         },
         _openModelUpdateDialog : function (model) {
            var dialog = main.getUI().getDialog();
            
            dialog.show({
               load : function () {
                  dialog.setInputValue("title", model.getTitle());
                  dialog.setInputValue("description", model.getDescription());
               },
               submit: function (data) {
                  model
                     .onSuccess(function (data) {
                        dialog.showResponseMessage(data);
                        clientstate.updateUsedSpace();
                     })
                     .onFailure(function (data) {
                        dialog.showResponseMessage(data);
                     })
                     .onError(dialog.showNetworkError)
                     .save(data);
               },
               url : "/form/update/model"
            });
         },
         _openModelDeleteDialog : function (model) {
            var dialog = main.getUI().getDialog(),
                modelType = model.getType();
            
            
            dialog.show({
               load : function () {
                  $("#mp-dialog-model-title").text(modelType + " - " + model.getTitle());
               },
               submit: function (data) {
                  model
                     .onSuccess(function (data) {
                        dialog.showResponseMessage(data);
                        clientstate.updateUsedSpace();
                     })
                     .onFailure(function (data) {
                        dialog.showResponseMessage(data);
                     })
                     .onError(dialog.showNetworkError)
                     .delete(model, true);
               },
               url : "/form/delete/model"
            });
         },
         _openAlbumShareDialog : function (album) {
            var dialog = main.getUI().getDialog();
            
            dialog.show({
               load : function () {
                  $("#mp-open-album-password-form").on("click", function () {
                     var $form = $("#mp-album-password-form");
                     if ($form.is(":hidden")) {
                        $("#mp-album-share-help").stop(true).hide();
                        $form.stop(true).slideToggle(100);
                     } else {
                        $form.stop(true).slideToggle(100);
                     }
                  });
                  $("#mp-open-album-share-help").on("click", function () {
                     var $help = $("#mp-album-share-help");
                     if ($help.is(":hidden")) {
                        $("#mp-album-password-form").stop(true).hide();
                        $help.stop(true).slideToggle(100);
                     } else {
                        $help.stop(true).slideToggle(100);
                     }
                  });
                  $("form[name='update-album-password']").attr("action", "/album/" + album.getId() + "password");
                  console.log("http://" + window.location.host + "/album/" + album.getId() + "/view/" + album.getSecret() + "/");
                  $("a#album-url").text("http://" + window.location.host + "/album/" + album.getId() + "/view/" + album.getSecret() + "/");
                  $("a#album-url").attr("href", "http://" + window.location.host + "/album/" + album.getId()  + "/view/" + album.getSecret() + "/");
                  $("a#album-url").css("cursor", "default");
                  $("#mp-dialog-button-save").button("disable");
                  $("#album-password")
                     .on("keyup keypress", null, function () {
                        if (this.value.length > 0) {
                           $("#mp-dialog-button-save").button("enable");
                        }
                     })
                     .on("keyup", null, "backspace", function () {
                        if (this.value.length === 0) {
                           $("#mp-dialog-button-save").button("disable");
                        }
                     });
               },
               submit: function (formData) {
                  $.ajax({
                     type: "POST",
                     dataType: "json",
                     data: formData,
                     url: "/album/" + album.getId() + "/password",
                     success: function (response) {
                        dialog.showResponseMessage(response);
                     },
                     error : function () {
                        dialog.showNetworkError();
                     }
                  });
               },
               width: $(".mp-content").width() * 0.8,
               url : "/form/update/album/password"
            });
         },
         _openPhotosUpdateDialog : function (photos) {
            var instance = this;
            this.publish("load:dialog", {
               load : function () {
                  $("input[name='photos']").val(JSON.stringify(photos));
               },
               success : function () {
                  var place = main.getUIState().getCurrentLoadedPlace().getModel();
                  // update the 'real' photo order
                  photos.forEach(function (photo, index) {
                     place.getPhoto(photo.photo).order = photo.order;
                     console.log("Update order of photo %d successful.", index);
                  });
                  
                  console.log("All Photos updated. Updating Gallery.");
                  place.sortPhotos();
                  
                  photos = place.getPhotos().getAll();
                  main.getUI().getGallery().restart(photos);
                  if (main.getUI().getSlideshow().isStarted()) {
                     main.getUI().getSlideshow().restart(photos);
                  }
               },
               abort : function () {
                  console.log("UIFullGallery: Aborted updating order. Restoring old order");
                  instance.publish("abort:photoOrder");
                  //TODO this could be done better
                  main.getUI().getAdminGallery().refresh();
               },
               type : CONFIRM_DIALOG,
               url : "/update-photos"
            });
         }
      });
   });

