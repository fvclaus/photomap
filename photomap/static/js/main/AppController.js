/*jslint */
/*global $, define, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define(["dojo/_base/declare", "util/Communicator", "ui/UIState"], 
       function (declare, communicator, state) {
          return declare(null, {
             
             constructor : function () {
                
                communicator.subscribeOnce("init", this._init);
                
                communicator.subscribe({
                   "mouseover:marker": this._markerMouseover,
                   "mouseout:marker": this._markerMouseout,
                   "click:marker": this._markerClick,
                   "insert:marker": this._markerInsert
                });
                
                communicator.subscribe("change:photo change:place change:album", this._modelUpdate);
                communicator.subscribe("change:usedSpace", this._usedSpaceUpdate);
               
                communicator.subscribe("delete:photo delete:place delete:album", this._modelDelete);
                
                communicator.subscribe("processed:album processed:place processed:photo", this._modelInsert);
                
                if (state.isAlbumView()) {
                   
                   communicator.subscribe({
                      "mouseenter:galleryThumb": this._galleryThumbMouseenter,
                      "mouseleave:galleryThumb": this._galleryThumbMouseleave,
                      "click:galleryThumb": this._galleryThumbClick
                   });
                   
                   communicator.subscribe("beforeLoad:slideshow", this._slideshowBeforeLoad);
                   communicator.subscribe("update:slideshow", this._slideshowUpdate);
                   
                   communicator.subscribe("open:place", this._placeOpen);
                   
                   communicator.subscribe({
                      "delete:place": this._placeDelete,
                      "delete:photo": this._photoDelete
                   });
                }
                
                
             },
             _init : function () {
                main.getUI().getInformation().init();
                //main.getMap().init();
                
                if (state.isAlbumView()) {
                   main.getUI().getGallery().init();
                   main.getUI().getSlideshow().init();
                }
             },
             _galleryThumbMouseenter : function (data) {
                main.getUI().getControls().showPhotoControls(data);
             },
             _galleryThumbMouseleave : function () {
                main.getUI().getControls().hide(true);
             },
             _galleryThumbClick : function (photo) {
                main.getUI().getSlideshow().navigateTo(photo);
             },
             _markerMouseover : function (context) {
                main.getUI().getControls().show(context);
             },
             _markerMouseout : function () {
                main.getUI().getControls().hide(true);
             },
             _markerClick : function (model) {
                main.getUI().getInformation().update(model);
             },
             _markerInsert : function (data) {
                
                state.insertMarker(data.marker);
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
                main.getUI().getGallery().checkSlider();
             },
             _slideshowBeforeLoad : function () {
                main.getUI().getInformation().hideDetail();
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
                   main.getUI().getGallery().deletePhoto(photo);
                   main.getUI().getSlideshow().deletePhoto(photo);
                   state.getCurrentLoadedPlace().deletePhoto(photo);
                } else if (type === "Place") {
                   main.getUI().getGallery().placeDeleteReset(place);
                   main.getUI().getSlideshow().placeDeleteReset(place);
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
             }
          });
       });

