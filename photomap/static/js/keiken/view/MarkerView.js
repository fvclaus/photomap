/*jslint */
/*global $, define, main, window, google, ZOOM_LEVEL_CENTERED, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON  */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class represents either an Album or a Place as a marker on the map
 * @requires View, MarkerPresenter
 */

define(["dojo/_base/declare",
        "./View",
        "../presenter/MarkerPresenter",
        "../util/Communicator"],
   function (declare, View, MarkerPresenter, communicator) {
      
      return declare(View,  {
         constructor : function (map, marker, model) {
            
            this.map = map;
            this.presenter = new MarkerPresenter(this, model);
            this.marker = marker;
            
            this.isSingleClick = false; // needed to prevent click/dblClick interference
            
            // show only when requested
            this.hide();
            this._bindMarkerListener();
         },
         getMap : function () {
            return this.map;
         },
         getMarker : function () {
            return this.marker;
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
         /**
          * @public
          * @description Centers the Map on the Marker
          */
         center : function () {
            this.map.centerMarker(this);
         },
         centerAndMove : function (percentage, direction) {
            
            this.center();
            
            if (direction === "left" || direction === "right") {
               this.map.moveHorizontal(percentage, direction);
            } else if (direction === "up" || direction === "down") {
               this.map.moveVertical(percentage, direction);
            }
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
         setIcon : function (icon) {
            this.marker.setIcon(new google.maps.MarkerImage(icon.url, undefined, undefined, undefined, new google.maps.Size(icon.width, icon.height, "px", "px")));
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
               communicator.publish("mouseover:Marker", instance.presenter);
            });
            this.addListener("mouseout", function () {
               // hide EditControls after a small timeout, when the EditControls are not entered
               // the EditControls-Box is never seamlessly connected to a place, so we need to give the user some time
               communicator.publish("mouseout:Marker", instance.presenter);
            });
            this.addListener("dblclick", function () {
               instance.isSingleClick = false;
               communicator.publish("dblClicked:Marker", instance.presenter);
            });
            this.addListener("click", function () {
               // since google map does trigger click even if user is doubleclicking we have to prevent this event from bubbling up if the user is actually doubleclicking
               instance.isSingleClick = true;
               window.setTimeout(function () {
                  if (instance.isSingleClick) {
                     instance.isSingleClick = false;
                     communicator.publish("clicked:Marker", instance.presenter);
                  }
               }, 800);
            });
         }
      });
   });
