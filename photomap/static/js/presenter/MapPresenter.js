/*global $, define, main*/


"use strict";


define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "view/MarkerView", "util/ClientState", "ui/UIState"],
       function (declare, Presenter, communicator, MarkerView, clientstate, state) {
          return declare(Presenter,  {
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
                console.log(model);
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
             init : function (albumCollection) {
                
                console.log("in map init");
                var markers;
                // switch between albumview and dashboard (different map)
                if (state.isAlbumView()) {
                   //in this case albumCollection is actually just a single album with a placeCollection
                   markers = this.initMarkers(albumCollection.getPlaces().getAll());
                   // show the map depending on amount of markers
                   if (markers.length <= 0) {
                      this.view.expandBounds(state.getAlbum());
                   } else if (markers.length === 1) {
                      this.view.expandBounds(markers[0]);
                   } else {
                      this.fitMapToMarkers(markers);
                   }
                   
                } else if (state.isDashboardView()) {
                   markers = this.initMarkers(albumCollection);
                   // show the map depending on amount of markers
                   if (markers.length <= 0) {
                      this.view.showWorld();
                   } else if (markers.length === 1) {
                      this.view.expandBounds(markers[0]);
                   } else {
                      this.fitMapToMarkers(markers);
                   }
                }
                // set map options if interactive
                this.view.map.setOptions(this.view.mapOptions);
                this.view.setMapCursor();
                if (markers.lengeth <= 0) {
                   this.view.setNoMarkerMessage();
                }
                
                communicator.publish("insert:markersInitialInsert", markers);
             },
             showAll : function () {
                this.fitMapToMarkers(state.getMarkers());
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
          });
       });