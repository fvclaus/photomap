/*global $, define, main*/


"use strict";


define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "view/MarkerView", "util/ClientState", "ui/UIState"],
       function (declare, Presenter, communicator, MarkerView, clientstate, state) {
          return declare(Presenter,  {
             click : function (event) {

                if (!this.view.isDisabled()) {
                   //create new place with description and select it
                   if (!state.isDashboardView()) {
                      this._insert(event, "place");
                   } else {
                      this._insert(event, "album");
                   }
                }
             },
             centerChanged : function () {
                communicator.publish("change:mapCenter");
             },
             getCenter : function () {
                return this.view.getMapCenter();
             },
             storeCurrentState : function () {
                this.view.storeCurrentState();
             },
             restoreSavedState : function () {
                this.view.restoreSavedState();
             },
             /**
              * @public
              * @param {Marker} marker
              */
             triggerClickOnMarker : function (marker) {
                this.view.triggerEventOnMarker(marker, "click");
             },
             /**
              * @public
              * @param {Marker} marker
              */
             triggerDblClickOnMarker : function (marker) {
                this.view.triggerEventOnMarker(marker, "dblclick");
             },
             triggerMouseOverOnMarker : function (marker) {
                this.view.triggerEventOnMarker(marker, "mouseover");
             },
             insertMarker : function (model, init) {
                var markerImplementation = this.view.createMarker(model),
                   markerView = new MarkerView(this.view, markerImplementation, model),
                   marker = markerView.getPresenter();
                
                if (!init) {
                  communicator.publish("insert:marker", marker);
                }
                
                return marker;
             },
             setNoMarkerMessage : function () {
                this.view.setNoMarkerMessage();
             },
             getPositionInPixel : function (element) {
                return this.view.getPositionInPixel(element);
             },
             initMarkers : function (models) {
                var instance = this,
                   markers = [];
                $.each(models, function (index, model) {
                   markers.push(instance.insertMarker(model, true));
                });
                
                return markers;
             },
             init : function (models) {
                
                console.log("in map init");
                var markers = this.initMarkers(models);
                // switch between albumview and dashboard (different map)
                if (state.isAlbumView()) {
                   // show the map depending on amount of markers
                   if (markers.length <= 0) {
                      this.view.expandBounds(state.getAlbum());
                   } else if (markers.length === 1) {
                      this.view.expandBounds(markers[0]);
                   } else {
                      this.fitMapToMarkers(markers);
                   }
                   
                   if (state.isAdmin()) {
                      this.view.bindClickListener();
                   }
                   
                } else if (state.isDashboardView()) {
                   // show the map depending on amount of markers
                   if (markers.length <= 0) {
                      this.view.showWorld();
                   } else if (markers.length === 1) {
                      this.view.expandBounds(markers[0]);
                   } else {
                      this.fitMapToMarkers(markers);
                   }
                   
                   this.view.bindClickListener();
                }
                // set map options if interactive
                this.view.map.setOptions(this.view.mapOptions);
                this.view.setMapCursor();
                if (markers.lengeth <= 0) {
                   this.view.setNoMarkerMessage();
                }
                
                communicator.publish("insert:markersInitialInsert", markers);
             },
             fitMapToMarkers : function (markers) {
                var latLngData = [];
                
                $.each(markers, function (index, marker) {
                   latLngData.push({
                      lat : marker.getLat(),
                      lng : marker.getLng()
                   });
                });
                this.view.fit(latLngData);
             },
             _insert : function (event, modelName) {
                 var instance = this,
                     lat = event.lat,
                     lng = event.lng,
                     // build url -> format /models/model/(id/)request
                     requestUrl = "/" + modelName + "s/" + modelName + "/insert";

                 communicator.publish("load:dialog", {
                    load : function () {
                       $("form[name='insert-" + modelName + "']").attr("action", requestUrl);
                       $("input[name=lat]").val(lat);
                       $("input[name=lon]").val(lng);
                       if ($("input[name=album]").size() > 0) {
                          $("input[name=album]").val(state.getAlbum().getId());
                       }
                    },
                    submit : function () {
                       //get name + description
                       var title = $("[name=title]").val(),
                           description = $("[name=description]").val();
                       //dont create yet, server might return error
                       state.store(TEMP_TITLE_KEY, title);
                       state.store(TEMP_DESCRIPTION_KEY, description);
                    },
                    success : function (data) {
                       console.log("insert success");
                       data.lng = lng;
                       data.lat = lat;
                       communicator.publish("insert:" + modelName, data);
                    },
                    url : requestUrl,
                    context : this
                 });
              }
          });
       });