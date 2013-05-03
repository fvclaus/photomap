/*jslint */
/*global $, define, main, google, ZOOM_LEVEL_CENTERED, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON  */

"use strict";

define(["dojo/_base/declare", "view/View", "presenter/MarkerPresenter"],
       function (declare, View, MarkerPresenter) {
          
          return declare(View,  {
             constructor : function (map, marker, model) {
                
                this.map = map;
                this.presenter = new MarkerPresenter(this, model);
                this.marker = marker;
                this.centered = false;
                
                // show only when requested
                this.hide();
                this._bindMarkerListener();
             },
             getMap : function () {
               return this.map; 
             },
             setCentered : function (centered) {
                this.centered = centered;
             },
             isCentered : function () {
                return this.centered;
             },
             /**
              * @public
              * @description Shows the Marker on the Map
              */
             show : function () {
                this.marker.setVisible(true);
             },
             /**
              * @public
              * @description Hides the Marker on the Map
              */
             hide : function () {
                this.marker.setVisible(false);
             },
             enable : function () {
                this.presenter.checkIconStatus();
                this.setCursor("");
             },
             disable : function () {
                this.presenter.showDisabledIcon();
                this.setCursor("not-allowed");
             },
             activate : function () {
                this.active = true;
             },
             deactivate : function () {
                this.active = false;
             },
             /**
              * @public
              * @description Centers the Map on the Marker
              */
             center : function () {
                this.map.centerMarker(this.marker);
                this.centered = true;
             },
             centerAndMove : function (percentage, direction) {
                
               if (!this.centered) {
                  this.map.storeCurrentState();
                  this.center();
                  
                  if (direction === "left" || direction === "right") {
                     this.map.moveHorizontal(percentage, direction);
                  } else if (direction === "up" || direction === "down") {
                     this.map.moveVertical(percentage, direction);
                  }
                }
             },
             getPosition : function () {
                return this.marker.getPosition();
             },
             getSize : function () {
                return this.marker.getIcon().size;
             },
             /**
              * @description Adds an listener to an event triggered by the Marker
              * @param {String} event
              * @param {Function} callback
              */
             addListener : function (event, callback) {
                this.map.addListenerToMarker(this, event, callback);
             },
             /**
              @public
              @summary Used by the Map to get the Marker instance
              */
             getImplementation : function () {
                return this.marker;
             },
             /**
              * @public
              * @summary Used by the Map to set the Marker instance
              * @param {MarkerClass} implementation Concrete implementation of a marker class, eg. google.maps.MapMarker
              */
             setImplementation : function (implementation) {
                this.marker =  implementation;
             },
             /**
              @public
              */
             setCursor : function (cursor) {
                this.marker.setCursor(cursor);
             },
             triggerClick : function () {
                this.map.triggerClickOnMarker(this);
             },
             triggerDoubleClick : function () {
                this.map.triggerDblClickOnMarker(this);
             },
             triggerMouseOver : function () {
                this.presenter.mouseOver();
             },
             /**
              @private
              */
             setOption : function (options) {
                if (typeof options.icon !== 'undefined') {
                   this.marker.setIcon(new google.maps.MarkerImage(options.icon));
                }
                if (typeof options.zindex !== 'undefined') {
                   this.marker.setZIndex(options.zindex);
                }
             },
             /**
              * @private
              */
             _bindMarkerListener : function () {
                var instance = this;

                this.addListener("mouseover", function () {
                   instance.presenter.mouseOver();
                });
                this.addListener("mouseout", function () {
                   instance.presenter.mouseOut();
                });
                this.addListener("dblclick", function () {
                   instance.presenter.dblClick();
                });
                this.addListener("click", function () {
                   instance.presenter.click();
                });
             }
          });
       });
