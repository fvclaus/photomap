/*global $, define, main, assertTrue, gettext */


"use strict";


define([
   "dojo/_base/declare",
   "./Presenter",
   "../util/Communicator",
   "../view/MarkerView"
],
   function (declare, Presenter, communicator, MarkerView) {
      return declare(Presenter,  {
         constructor : function () {
            this.markerModelCollection = null;
            this.markerPresenter = null;
            this.selectedMarker = null;
            this.openedMarker = null;
         },

         startup : function (mapData, albumview, admin) {
            if (albumview) {
               //in this case mapData is actually just a single album with a place-collection
               this.markerModelCollection = mapData.getPlaces();
               // zoom out when no places are created yet
               if (this.markerModelCollection.size() === 0) {
                  this.view.expandBounds(mapData);
               }
               this._setMapMessage(true, admin);
               if (admin) {
                  this.view.bindClickListener();
               }
            } else {
               // here mapData is a collection of all albums of the user
               this.markerModelCollection = mapData;
               // show whole world if no albums are created yet
               if (this.markerModelCollection.size() === 0) {
                  this.view.showWorld();
               }
               this.view.bindClickListener();
               this._setMapMessage(false);
            }
            // set array of marker-presenter
            this.markerPresenter = this.initMarkers(this.markerModelCollection.getAll());
            // show the map depending on amount of markers
            if (this.markerModelCollection.size() === 1) {
               this.view.expandBounds(this.markerModelCollection.getByIndex(0));
            } else {
               this._fitMapToMarkers(this.markerModelCollection.getAll());
            }
            // set map options if interactive
            this.view.map.setOptions(this.view.mapOptions);
            this.view.setMapCursor();
            // show message if no markers are displayed
            this.view.toggleMessage((this.markerModelCollection.size() === 0));
            this._bindCollectionListener();

         },
         getOpenedMarker : function () {
            return this.openedMarker;
         },
         getSelectedMarker : function () {
            return this.selectedMarker;
         },
         /* ------------------------------------- */
         /* ---------- Map Management  ---------- */

         getPositionInPixel : function (element) {
            return this.view.getPositionInPixel(element);
         },
         /* ------------------------------------- */
         /* --------- Marker Management --------- */
         updateMarkerStatus : function (presenterOrModel, status) {
            assertTrue((status === "select" || status === "open"), "Marker status can just be 'select' or 'open'.");

            // if the given place or album is not a presenter of a marker you have to get its presenter first..
            var presenter = (presenterOrModel instanceof Presenter) ? presenterOrModel : this.getMarkerPresenter(presenterOrModel);

            if (status === "select") {
               // change icon of selected (soon to be old) marker; (!) when a marker is deselected it might still be opened in which case its icon has to change to selected
               if (this.selectedMarker) {
                  this.selectedMarker.updateIcon((this.selectedMarker === this.openedMarker), false);
               }
               // change selected marker
               this.selectedMarker = presenter;
               // change icon of new selected marker; (!) when a marker is selected it might already be opened in which case its icon doesn't change
               this.selectedMarker.updateIcon((this.selectedMarker === this.openedMarker), true);
            } else {
               // when a marker is opened it's also selected at first -> both selected and opened have to be changed and updated (icon-wise)
               if (this.selectedMarker) {
                  this.selectedMarker.updateIcon(false, false);
               }
               this.selectedMarker = presenter;
               if (this.openedMarker) {
                  this.openedMarker.updateIcon(false, false);
               }
               this.openedMarker = presenter;
               // change icon of new opened marker
               this.openedMarker.updateIcon(true, true);
            }
         },
         resetSelectedMarker : function () {
            if (this.selectedMarker) {
               this.selectedMarker.updateIcon((this.selectedMarker === this.openedMarker), false);
               this.selectedMarker = null;
            }
         },
         resetOpenedMarker : function () {
            if (this.openedMarker) {
               this.openedMarker.updateIcon(false, (this.selectedMarker === this.openedMarker));
               this.openedMarker = null;
            }
         },
         updateMarkerIcons : function (presenter) {
            var opened, selected;

            this.markerPresenter.forEach(function (markerPresenter) {
               opened = (markerPresenter === this.openedMarker);
               selected = (markerPresenter === this.selectedMarker);
               markerPresenter.checkIconStatus(opened, selected);
            });
         },
         getMarkerPresenter : function (model) {
            return this.markerPresenter.filter(function (markerPresenter) {
               return (markerPresenter.getModel() === model);
            })[0];
         },
         centerMarker : function (model, offset) {
            var presenter = this.getMarkerPresenter(model);
            if (offset < 0) {
               presenter.centerAndMoveLeft(-offset);
            } else {
               presenter.centerAndMoveRight(offset);
            }
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

            marker.show();
            marker.updateIcon(false, false);
            if (!init) {
               this.view.toggleMessage(false);
               this.triggerDblClickOnMarker(marker);
            }

            return marker;
         },
         initMarkers : function (models) {
            var instance = this,
               presenter = [];
            models.forEach(function (model) {
               presenter.push(instance.insertMarker(model, true));
            });
            return presenter;
         },
         showAll : function () {
            this._fitMapToMarkers(this.markerModelCollection.getAll());
         },
         showWorld : function () {
            this.view.showWorld();
         },
         /* ----------------------------------- */
         /* --------- private methods --------- */
         _setMapMessage : function (albumview, admin) {
            if (!albumview) {
               this.view.setMessage(gettext("MAP_NO_ALBUMS"), {
                  hideOnMouseover: false,
                  hideOnClick: true,
                  openOnMouseleave: true
               });
            } else {
               if (admin) {
                  this.view.setMessage(gettext("MAP_NO_PLACES_ADMIN"));
               } else {
                  this.view.setMessage(gettext("MAP_NO_PLACES_GUEST"));
               }
            }
         },
         _fitMapToMarkers : function (models) {
            var latLngData = [];

            models.forEach(function (model) {
               latLngData.push({
                  lat : model.getLat(),
                  lng : model.getLng()
               });
            });
            this.view.fit(latLngData);
         },
         _bindCollectionListener : function () {
            this.markerModelCollection
               .onDelete(function (model) {
                  this.getMarkerPresenter(model).hide();
               }, this, "Map")
               .onInsert(function (model) {
                  this.insertMarker(model);
               }, this, "Map");
         }
      });
   });
