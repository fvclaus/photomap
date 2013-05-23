/*jslint */
/*global $, define, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define(["dojo/_base/declare", "util/Communicator", "ui/UIState", "util/ClientState"], 
       function (declare, communicator, state, clientstate) {
          return declare(null, {
             
             constructor : function () {
                
                communicator.subscribeOnce("init", this._init);
                communicator.subscribe("load:dialog", this._dialogLoad);
                communicator.subscribe({
                   "enable:ui": this._uiEnable,
                   "disable:ui": this._uiDisable
                }, this);
                communicator.subscribe("activate:view", this._viewActivation)
                
                communicator.subscribe({
                   "mouseover:marker": this._markerMouseover,
                   "mouseout:marker": this._markerMouseout,
                   "click:marker": this._markerClick,
                   "insert:marker": this._markerInsert
                });
                
                communicator.subscribe("change:photo change:place change:album", this._modelUpdate);
                communicator.subscribe("delete:photo delete:place delete:album", this._modelDelete);
                communicator.subscribe("processed:album processed:place processed:photo", this._modelInsert);
                
                communicator.subscribe("change:usedSpace", this._usedSpaceUpdate);
                communicator.subscribe("change:mapCenter", this._mapCenterChanged);
                communicator.subscribe("close:detail", this._detailClose);
                
                if (state.isAlbumView()) {
                   
                   communicator.subscribe({
                      "mouseenter:galleryThumb": this._galleryThumbMouseenter,
                      "mouseleave:galleryThumb": this._galleryThumbMouseleave,
                      "click:galleryThumb": this._galleryThumbClick
                   });
                   
                   communicator.subscribe({
                      "beforeLoad:slideshow": this._slideshowBeforeLoad,
                      "update:slideshow": this._slideshowUpdate,
                      "enable:slideshow": this._slideshowEnable,
                      "disable:slideshow": this._slideshowDisable,
                      "click:slideshowImage": this._slideshowClick
                   });
                   
                   communicator.subscribe("navigate:fullscreen", this._fullscreenNavigate);
                   
                   communicator.subscribe("open:place", this._placeOpen);
                   
                   communicator.subscribe("change:photoOrder", this._photoOrderChange);
                   communicator.subscribe("visited:photo", this._photoVisited);
                }
             },
             _init : function () {
                main.getUI().getInformation().init();
                clientstate.init();
                //main.getMap().init();
                
                if (state.isAlbumView()) {
                   main.getUI().getGallery().init();
                   main.getUI().getSlideshow().init();
                   main.getUI().getFullscreen().init();
                }
             },
             _uiEnable : function () {
                this._setUIDisabled(false);
             },
             _uiDisable : function () {
                this._setUIDisabled(true);
             },
             _setUIDisabled : function (disable) {
                assertTrue(disable !== undefined, "disable mustn't be undefined");
                
                var ui = main.getUI(),
                    markers = state.getMarkers();
                
                if (state.isAlbumView()) {
                   ui.getGallery().setDisabled(disable);
                   ui.getSlideshow().setDisabled(disable);
                   ui.getFullscreen().setDisabled(disable);
                }
                ui.getControls().setDisabled(disable);
                ui.getInformation().setDisabled(disable);
                main.getMap().setDisabled(disable);
                $.each(markers, function (index, marker) {
                      marker.setDisabled(disable);
                });
                
                if (!disable) {
                   this._enableLinks();
                } else {
                   this._disableLinks();
                }
             },
             _slideshowDisable : function () {
                main.getUI().getSlideshow().setDisabled(true);
             },
             _slideshowEnable : function () {
                main.getUI().getSlideshow().setDisabled(false);
             },
             _fullscreenDisable : function () {
                main.getUI().getFullscreen().setDisabled(true);
             },
             _fullscreenEnable : function () {
                main.getUI().getFullscreen().setDisabled(false);
             },
             _disableLinks : function () {
               
                 $("a, .mp-control").css({
                    cursor: "not-allowed"
                 });
                 $("a").on("click.Disabled", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                 }); 
             },
             _enableLinks : function () {
                 
                 console.log("in _enableLinks");
                 $("a, .mp-control").css({
                    cursor: ""
                 });
                 $("a").off(".Disabled");
             },
             _viewActivation : function (viewName) {
               var ui = main.getUI(),
                  possibleViews = {
                     Slideshow: ui.getSlideshow(),
                     Gallery: ui.getGallery(),
                     Fullscreen: ui.getFullscreen(),
                     Map: main.getMap(),
                     Dialog: ui.getInput()
                  }
                  
               possibleViews[viewName].setActive(true);
               $.each(possibleViews, function (name, view) {
                  if (view && name !== viewName) {
                     view.setActive(false);
                  }
               });
             },
             _detailClose : function () {
                if (state.isDashboardView()) {
                   main.getMap().restoreSavedState();
                }
             },
             _photoOrderChange : function (photos) {
                place = main.getUIState().getCurrentLoadedPlace().getModel();
                // update the 'real' photo order
                photos.forEach(function (photo, index) {
                   place.getPhoto(photo.photo).order = photo.order;
                   console.log("Update order of photo %d successful.", index);
                });
                
                console.log("All Photos updated. Updating Gallery.");
                place.sortPhotos();
                
                photos = place.getPhotos();
                main.getUI().getGallery().restart(photos);
                if (main.getUI().getSlideshow().isStarted()) {
                   main.getUI().getSlideshow().restart(photos);
                }
             },
             _dialogLoad : function (options) {
                main.getUI().getInput().show(options);
             },
             _mapCenterChanged : function () {
                $.each(state.getMarkers(), function (index, marker) {
                   marker.setCentered(false);
                });
             },
             _galleryThumbMouseenter : function (data) {
                main.getUI().getControls().showPhotoControls(data);
             },
             _galleryThumbMouseleave : function () {
                main.getUI().getControls().hide(true);
             },
             _galleryThumbClick : function (photo) {
                main.getUI().getControls().hide(false);
                main.getUI().getSlideshow().navigateTo(photo);
             },
             _markerMouseover : function (context) {
                main.getUI().getControls().show({
                   "context": context,
                   pixel: main.getMap().getPositionInPixel(context)
                });
             },
             _markerMouseout : function () {
                main.getUI().getControls().hide(true);
             },
             _markerClick : function (marker) {
                
                var detail = main.getUI().getInformation();
                
                detail.update(marker.getModel());
                
                if (state.isDashboardView()) {
                   marker.centerAndMoveLeft(.25);
                   detail.slideIn();
                }
             },
             _markerInsert : function (data) {
                
                state.insertMarker(data.marker);
                data.marker.checkIconStatus();
                data.marker.show();
                if (data.open) {
                   data.marker.open();
                }
             },
             _modelUpdate : function (model) {
                main.getUI().getInformation().update(model);
             },
             _usedSpaceUpdate : function (data) {
                main.getUI().getInformation().updateUsedSpace(data);
             },
             _slideshowUpdate : function (photo) {
                main.getUI().getInformation().update(photo);
                main.getUI().getFullscreen().update(photo);
                main.getUI().getGallery().checkSlider();
                photo.setVisited(true);
             },
             _slideshowBeforeLoad : function () {
                main.getUI().getInformation().hideDetail();
             },
             _slideshowClick : function () {
                main.getUI().getFullscreen().open();
             },
             _fullscreenNavigate : function (direction) {
                main.getUI().getSlideshow().navigate(direction);
             },
             _modelInsert : function (model) {
                var type = model.getModelType();
                
                if (type === "Photo") {
                   main.getUI().getGallery().insertPhoto(model);
                   main.getUI().getSlideshow().insertPhoto(model);
                } else if (type === "Album" || type === "Place") {
                   main.getMap().insertMarker(model, true);
                } else {
                   throw new Error("UnknownModelError");
                }
             },
             _modelDelete : function (model) {
                var type = model.getModelType();
                
                main.getUI().getInformation().empty(model);
                
                if (type === "Photo") {
                   main.getUI().getGallery().deletePhoto(model);
                   main.getUI().getSlideshow().deletePhoto(model);
                   state.getCurrentLoadedPlace().getModel().deletePhoto(model);
                } else if (type === "Place") {
                   main.getUI().getGallery().placeDeleteReset(model);
                   main.getUI().getSlideshow().placeDeleteReset(model);
                }
                
                if (type === "Place" || type === "Album") {
                   console.log(state.getMarker(model));
                   state.getMarker(model).hide();
                }
                
                
             },
             _placeOpen : function (place) {
                main.getUI().getInformation().update(place);
                main.getUI().getGallery().reset();
                main.getUI().getGallery().start(place.getPhotos());
                main.getUI().getSlideshow().reset();
                main.getUI().getMessage().hide();
             },
             _photoVisited : function (photo) {
                main.getUI().getGallery().setPhotoVisited(photo);
             }
          });
       });

