/*jslint */
/*global $, main, define*/

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Provides the logic to present the Album and Place models and to handle all user interaction on the marker
 * @requires Presenter, Communicator
 */

define(["dojo/_base/declare",
        "./Presenter",
        "../util/Communicator"],
   function (declare, Presenter, communicator, state) {
      return declare(Presenter, {
         constructor : function () {
            this.opened = false;
         },
         show : function () {
            this.view.show();
         },
         hide : function () {
            this.view.hide();
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
         updateIcon : function (opened, selected) {
            
            var visited = true;
            
            if (this.model.getType() === "Album") {
               
               if (selected) {
                  this.showSelectedIcon();
               } else {
                  this.showUnselectedIcon();
               }
               
            } else if (this.model.getType() === "Place") {
               
               //TODO this is done every single time a user clicks on a place -> might be more efficient if place had a visited attribute which is set when all it's photos are visited
               this.model.getPhotos().getAll().forEach(function (photo) {
                  visited = visited && photo.isVisited();
               });
               
               if (selected && !opened) {
                  this.showSelectedIcon();
               } else if (opened) {
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
            var markerIcon = (this.model.getType() === "Place") ? PLACE_VISITED_ICON : ALBUM_VISITED_ICON;
            this._showIcon(markerIcon);
         },
         showLoadedIcon : function () {
            var markerIcon = (this.model.getType() === "Place") ? PLACE_LOADED_ICON : ALBUM_LOADED_ICON;
            this._showIcon(markerIcon);
         },
         showSelectedIcon : function () {
            var markerIcon = (this.model.getType() === "Place") ? PLACE_SELECTED_ICON : ALBUM_SELECTED_ICON;
            this._showIcon(markerIcon);
         },
         showUnselectedIcon : function () {
            var markerIcon = (this.model.getType() === "Place") ? PLACE_UNSELECTED_ICON : ALBUM_UNSELECTED_ICON;
            this._showIcon(markerIcon);
         },
         showDisabledIcon : function () {
            var markerIcon = (this.model.getType() === "Place") ? PLACE_DISABLED_ICON : ALBUM_DISABLED_ICON;
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
         _showIcon : function (icon) {
            
            var markerIsPlace = (this.model.getType() === "Place");
               
            this.view.setIcon({
               url : icon,
               width: markerIsPlace ? PLACE_ICON_WIDTH : ALBUM_ICON_WIDTH,
               height: markerIsPlace ? PLACE_ICON_HEIGHT : ALBUM_ICON_HEIGHT
            });
         }
      });
   });
