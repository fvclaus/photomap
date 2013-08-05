/*jslint */
/*global $, define, main, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class Controls communication concerning models (especially IDU-requests)
 */

define(["dojo/_base/declare", "util/Communicator", "ui/UIState", "util/ClientState"], 
       function (declare, communicator, state, clientstate) {
          return declare(null, {
             
             constructor : function () {
                
                communicator.subscribe("click:galleryInsert", this._galleryInsert);
                communicator.subscribe("click:map", this._mapInsert);
                communicator.subscribe("click:photoUpdate click:placeUpdate click:albumUpdate", this._modelUpdate);
                communicator.subscribe("click:photoDelete click:placeDelete click:albumDelete", this._modelDelete);
             },
             /*
              * --------------------------------------------------
              * Handler: 
              * --------------------------------------------------
              */
             _galleryInsert : function () {
                var place = state.getCurrentLoadedPlace().getModel(),
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
                        })
                        .onFailure(function (data) {
                           dialog.showResponseMessage(data);
                        })
                        .onError(dialog.showNetworkError)
                        .insert(data);
                   },
                   url : "/dialog/insert/photo",
                   isPhotoUpload: true,
                   photoInputName: "photo"
                });
             },
             _mapInsert : function (eventData) {
                var dialog = main.getUI().getDialog(),
                  markerCollection,
                  modelType;
                  
                if (state.isDashboardView()) {
                   modelType = "Album";
                } else if (state.isAlbumView()) {
                   modelType = "Place";
                }
                markerCollection = state.getCollection(modelType);

                dialog.show({
                   load : function () {
                      if (modelType === "Place") {
                        dialog.setInputValue("album", state.getCurrentLoadedAlbum().getId());
                      }
                      dialog.setInputValue("lat", eventData.lat);
                      dialog.setInputValue("lon", eventData.lng);
                   },
                   submit: function (data) {
                      markerCollection
                        .onSuccess(function (data) {
                           dialog.showResponseMessage(data);
                        })
                        .onFailure(function (data) {
                           dialog.showResponseMessage(data);
                        })
                        .onError(dialog.showNetworkError)
                        .insert(data);
                   },
                   url : "/dialog/insert/" + modelType.toLowerCase(),
                });
             }
             _modelUpdate : function (model) {
                var dialog = main.getUI().getDialog(),
                  modelType = model.getType(),
                  collection = state.getCollection(modelType);
                  
                  
                dialog.show({
                   load : function () {
                      dialog.setInputValue("title", model.getTitle());
                      dialog.setInputValue("description", model.getDescription());
                   },
                   submit: function (data) {
                      collection
                        .onSuccess(function (data) {
                           dialog.showResponseMessage(data);
                        })
                        .onFailure(function (data) {
                           dialog.showResponseMessage(data);
                        })
                        .onError(dialog.showNetworkError)
                        .update(model, data);
                   },
                   url : "/dialog/update/" + model.getType().toLowerCase()
                });
             },
             _modelUpdate : function (model) {
                var dialog = main.getUI().getDialog(),
                  modelType = model.getType(),
                  collection = state.getCollection(modelType);
                  
                  
                dialog.show({
                   load : function () {
                      dialog.setInputValue("title", model.getTitle());
                      dialog.setInputValue("description", model.getDescription());
                   },
                   submit: function (data) {
                      collection
                        .onSuccess(function (data) {
                           dialog.showResponseMessage(data);
                        })
                        .onFailure(function (data) {
                           dialog.showResponseMessage(data);
                        })
                        .onError(dialog.showNetworkError)
                        .delete(model, data);
                   },
                   url : "/dialog/delete/" + model.getType().toLowerCase()
                });
             }
          });
       });

