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
                   "mouseout:marker": this._markerMouseout
                });
                
                communicator.subscribe("change:photo change:place change:album", this._modelUpdate);
                communicator.subscribe("change:usedSpace", this._usedSpaceUpdate);
               
                communicator.subscribe("delete:photo delete:place delete:album", this._modelDelete);
                
                if (state.isAlbumView()) {
                   
                   communicator.subscribe("beforeLoad:slideshow", this._slideshowBeforeLoad);
                  
                   communicator.subscribe("update:slideshow", this._slideshowUpdate);
                   communicator.subscribe("update:place", this._placeUpdate);
                   
                   communicator.subscribe("processed:photo", this._photoInsert);
                   
                   communicator.subscribe("delete:place", this._placeDelete);
                   communicator.subscribe("delete:photo", this._photoDelete);
                }
                
                
             },
             _init : function () {
                main.getUI().getInformation().init();
                
                if (state.isAlbumView()) {
                   main.getUI().getGallery().init();
                   main.getUI().getSlideshow().init();
                }
             },
             _markerMouseover : function (context) {
                main.getUI().getControls().show(context);
             },
             _markerMouseout : function () {
                main.getUI().getControls().hide(true);
             },
             _slideshowBeforeLoad : function () {
                main.getUI().getInformation().hideDetail();
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
             _placeUpdate : function (place) {
                main.getUI().getInformation().update(place);
             },
             _photoInsert : function (photo) {
                main.getUI().getGallery().insertPhoto(photo);
                main.getUI().getSlideshow().insertPhoto(photo);
             },
             _modelDelete : function (model) {
                main.getUI().getInformation().empty(model);
             },
             _placeDelete : function (place) {
                main.getUI().getGallery().placeDeleteReset(place);
                main.getUI().getSlideshow().placeDeleteReset(place);
             },
             _photoDelete : function (photo) {
                main.getUI().getGallery().deletePhoto(photo);
                main.getUI().getSlideshow().deletePhoto(photo);
             }
          });
       });

