/*global $, define, main*/


"use strict";


define(["dojo/_base/declare", 
        "./Presenter", 
        "../util/Communicator",
        "../view/MarkerView", 
        "../util/ClientState",
        "../ui/UIState"],
      function (declare, Presenter, communicator, MarkerView, clientstate, state) {
         return declare(Presenter,  {
            constructor : function () {
               this.markerModelCollection = null;
               this.markers = null;
            },
            
            init : function (albums) {
               
               console.log("in map init");
               // switch between albumview and dashboard (different map)
               if (state.isAlbumView()) {
                  //in this case albums is actually just a single album with a place-collection
                  this.markerModelCollection = albums.getPlaces();
                  this.markers = this.initMarkers(this.markerModelCollection.getAll());
                  
               } else if (state.isDashboardView()) {
                  this.markerModelCollection = albums;
                  markers = this.initMarkers(albumCollection);
                  
               }
               // show the map depending on amount of markers
                   if (markers.length <= 0) {
                     this.view.showWorld();
                  } else if (markers.length === 1) {
                     this.view.expandBounds(markers[0]);
                  } else {
                     this.fitMapToMarkers(markers);
                  }
               // show the map depending on amount of markers
                  if (markers.length <= 0) {
                     this.view.expandBounds(albums);
                  } else if (markers.length === 1) {
                     this.view.expandBounds(markers[0]);
                  } else {
                     this.fitMapToMarkers(this.markers);
                  }
               // set map options if interactive
               this.view.map.setOptions(this.view.mapOptions);
               this.view.setMapCursor();
               if (markers.length <= 0) {
                  this.view.setNoMarkerMessage();
               }
               
               communicator.publish("insert:markersInitialInsert", markers);
            },
            
            /* ------------------------------------- */
            /* ---------- Map Management  ---------- */
            
            centerChanged : function () {
               communicator.publish("change:mapCenter");
            },
            getCenter : function () {
               return this.view.getMapCenter();
            },
            getPositionInPixel : function (element) {
               return this.view.getPositionInPixel(element);
            },
         
            /* ------------------------------------- */      
            /* --------- Marker Management --------- */
            
             
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
            initMarkers : function (models) {
               var instance = this,
                  markers = [];
               $.each(models, function (index, model) {
                  markers.push(instance.insertMarker(model, true));
               });
               
               return markers;
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