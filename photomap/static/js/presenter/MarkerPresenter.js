/*jslint */
/*global $, main, define*/

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Provides the logic to present the Album and Place models and to handle all user interaction on the marker
 * @requires Presenter, Communicator, UIState
 */

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"],
       function (declare, Presenter, communicator, state) {
          return declare(Presenter, {
             show : function () {
                this.view.show();
             },
             hide : function () {
                this.view.hide();
             },
             mouseOver : function () {
                if (!this.view.isDisabled()) {
                   communicator.publish("mouseover:marker", this);
                }
             },
             mouseOut : function () {
                // hide EditControls after a small timeout, when the EditControls are not entered
                // the EditControls-Box is never seamlessly connected to a place, so we need to give the user some time
                communicator.publish("mouseout:marker");
             },
             dblClick : function () {
                if (!this.view.isDisabled()) {
                  this.switchCurrentLoadedMarker();
                  this.open();
                }
             },
             click : function () {
                
                var instance = this,
                   publish = function () {
                     instance.switchCurrentMarker();
                     communicator.publish('click:marker', instance);
                   };
                
                if (!this.view.isDisabled()) {
                   //timeout necessary to wait if user is actually dblclicking
                   window.setTimeout(publish, 500);
                }
             },
             resetCurrent : function () {
                this.switchCurrentMarker(true);
             },
             resetCurrentLoaded : function () {
                this.switchCurrentLoadedMarker(true);
             },
             switchCurrentMarker : function (reset) {
               
               var oldMarker = state.getCurrentMarker();
               
               if (!reset) {
                  state.setCurrentMarker(this);
               } else {
                  state.setCurrentMarker(null);
               }
               if (oldMarker && oldMarker !== this) {
                  oldMarker.checkIconStatus();
               }
               this.checkIconStatus();
             },
             switchCurrentLoadedMarker : function (reset) {
               
               var oldMarker = state.getCurrentLoadedMarker();
               
               if (!reset) {
                  state.setCurrentLoadedMarker(this);
               } else {
                  state.setCurrentLoadedMarker(null);
               }
               if (oldMarker && oldMarker !== this) {
                  oldMarker.checkIconStatus();
               }
               this.checkIconStatus();
             },
             center : function () {
                this.view.center();
             },
             centerAndMoveLeft : function (percentage) {
                this.view.centerAndMove(percentage, "left");
             },
             centerAndMoveRight : function (percentage) {
                this.view.centerAndMove(percentage, "right");
             },
             setCentered : function (centered) {
                this.view.setCentered(centered);
             },
             isCentered : function () {
                return this.view.isCentered();
             },
             getPosition : function () {
                return this.view.getPosition();
             },
             storePosition : function () {
                this.view.storePosition();
             },
             getStoredPosition : function () {
                this.view.getStoredPosition();
             },
              checkIconStatus : function () {
                 
                 var visited = true,
                    loadedMarker = state.getCurrentLoadedMarker(),
                    currentMarker = state.getCurrentMarker();
                 
                 if (this.model.getModelType() === "Album") {
                    
                    if (this.isDisabled()) {
                       this.showDisabledIcon();
                    } else if (this === currentMarker) {
                       this.showSelectedIcon();
                    } else {
                       this.showUnselectedIcon();
                    }
                    
                 } else if (this.model.getModelType() === "Place") {
                    
                        
                    this.model.getPhotos().forEach(function (photo) {
                       visited = visited && photo.isVisited();
                    });
                    
                    if (this.isDisabled()) {
                       this.showDisabledIcon();
                    } else if (this === currentMarker && this !== loadedMarker) {
                       this.showSelectedIcon();
                    } else if (this === loadedMarker) {
                       this.showLoadedIcon();
                    } else if (visited) {
                       this.showVisitedIcon();
                    } else {
                       this.showUnselectedIcon();
                    }
                 }
                 
              },
              setCursor : function (style) {
                 this.view.setCursor(style);
              },
              showVisitedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_VISITED_ICON : ALBUM_VISITED_ICON;
                 this._showIcon(markerIcon);
              },
              showLoadedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_LOADED_ICON : ALBUM_LOADED_ICON;
                 this._showIcon(markerIcon);
              },
              showSelectedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_SELECTED_ICON : ALBUM_SELECTED_ICON;
                 this._showIcon(markerIcon);
              },
              showUnselectedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_UNSELECTED_ICON : ALBUM_UNSELECTED_ICON;
                 this._showIcon(markerIcon);
              },
              showDisabledIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_DISABLED_ICON : ALBUM_DISABLED_ICON;
                 this._showIcon(markerIcon);
              },
              /**
              * @public
              * @returns {float} Latitude
              */
             getLat : function () {
                return this.model.getLat();
             },
             /**
              * @public
              * @returns {float} Longitude
              */
             getLng : function () {
                return this.model.getLng();
             },
             getLatLng : function () {
                var map = this.view.getMap();
                return map.createLatLng(this.getLat(), this.getLng());
             },
             open : function () {
                
                // switch to albumview if album is opened
                if (this.model.getModelType() === "Album") {
                   
                   // build url -> format models/model/(id/)request
                   window.location.href = '/album/' + this.model.getId() + '/view/' + this.model.getSecret() + "/";
                   
                // reset ui and (re)start gallery when place is opened
                } else if (this.model.getModelType() === "Place") {
   
                   communicator.publish("open:place", this.model);
                }
             },
              _showIcon : function (icon) {
                 
                 var markerIsPlace = (this.model.getModelType() === "Place");
                    
                 this.view.setIcon({
                    url : icon,
                    width: markerIsPlace ? PLACE_ICON_WIDTH : ALBUM_ICON_WIDTH,
                    height: markerIsPlace ? PLACE_ICON_HEIGHT : ALBUM_ICON_HEIGHT
                 });
              }
          });
       });
