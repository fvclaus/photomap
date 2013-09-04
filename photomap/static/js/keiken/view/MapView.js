/*jslint */
/*global $, define, google, main,  ALBUM_VIEW, DASHBOARD_VIEW, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, PLACE_DEFAULT_ICON, ALBUM_DEFAULT_ICON, ZOOM_LEVEL_CENTERED, SHADOW_ICON, PLACE_ICON_WIDTH, PLACE_ICON_HEIGHT, ALBUM_ICON_WIDTH, ALBUM_ICON_HEIGHT, MARKER_ICON_SHADOW_WIDTH, assert, assertTrue, gettext, PLACE_ICON_SHADOW_WIDTH, ALBUM_ICON_SHADOW_WIDTH, PLACE_SHADOW_ICON, ALBUM_SHADOW_ICON  */

"use strict";

/**
 * @author: Frederik Claus
 * @description: Facade for google maps
 */

define([
   "dojo/_base/declare",
   "./View",
   "../presenter/MapPresenter",
   "../util/Communicator",
   "../view/MarkerView",
   "../util/InfoText",
   "dojo/domReady!"
],
   function (declare, View, MapPresenter, communicator, MarkerView, InfoText) {
      var MapView = declare(View, {
         constructor : function () {
            
            this.$container = $("#mp-map");
            this.viewName = "Map";
            this._bindActivationListener(this.$container, this.viewName);
             // google.maps.Map
            this.map = null;
            // google.maps.StreetViewstreetview
            this.streetview = null;
            // the DOM element
            this.$mapEl = $('#map');
            this.$mapEl.data({
               originalWidth	: this.$mapEl.width(),
               originalHeight	: this.$mapEl.height()
            });
            this.ZOOM_OUT_LEVEL = 3;
            this.storedState = {
               zoom: null,
               center: null,
               type: null
            };
            // map gets called as part of the Main.init() function, so everything is in place already
            // the map options
            this.mapOptions = {
               mapTypeId : google.maps.MapTypeId.ROADMAP,
               mapTypeControl : true,
               mapTypeControlOptions : {
                  style : google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                  position : google.maps.ControlPosition.TOP_LEFT
               },
               panControl : true,
               panControlOptions : {
                  position : google.maps.ControlPosition.TOP_LEFT
               },
               zoomControl : true,
               zoomControlOptions : {
                  style : google.maps.ZoomControlStyle.SMALL,
                  position : google.maps.ControlPosition.TOP_LEFT
               },
               streetViewControl : true,
               streetViewControlOptions : {
                  position : google.maps.ControlPosition.TOP_LEFT
               },
               disableDoubleClickZoom : true
            };
            
            this.infotext = new InfoText(this.$container, "");
            // mode : fullscreen || normal
            this.mode = 'normal';
            this.presenter = new MapPresenter(this);
            this._create();
         },
         
         /* ------------------------------------ */
         /* ------ Map specific methods -------- */
         
         /**
          * @public
          * @summary Returns a object containing the absolute bottom and left position of the marker.
          * @param {InfoMarker} element 
          * @returns {Object} Containing the bottom and left coordinate as (!!)top(!!) and left attribute 
          */
         getPositionInPixel : function (element) {
            
            var projection, pixel, offset;
            
            projection = this.getOverlay().getProjection();
            pixel = projection.fromLatLngToContainerPixel(element.getLatLng());
            offset = this.$mapEl.offset();
            pixel.y += offset.top;
            pixel.x += offset.left;
            return {top : pixel.y, left : pixel.x};
         },
         /**
          * @public 
          * @description moves map-center;
          * @param percentage {Float} percentage of the map viewport by which the map center should be moved. Positive value => left 
          * @param direction {String} Optional! You may choose to specify a direction. input param "percentage" should be positive then
          */
         moveHorizontal : function (percentage, direction) {
            
            if (direction && direction === "right") {
               percentage *= -1;
            }
            
            
            this.move(this.$mapEl.width() * percentage, 0);
         },
         /**
          * @public 
          * @description moves map-center;
          * @param percentage {Float} percentage of the map viewport by which the map center should be moved. Positive value => up 
          * @param direction {String} Optional! You may choose to specify a direction. input param "percentage" should be positive then
          */
         moveVertical : function (percentage, direction) {
            
            if (direction && direction === "down") {
               percentage *= -1;
            }
            
            this.move(0, this.$mapEl.height() * percentage);
         },
         /**
          * @public 
          * @description wrapper for gmaps panBy to make it available to the public without being bound to gmaps API
          */
         move : function (x, y) {
            this.map.panBy(x, y);
         },
         setZoom : function (level) {
            
            var instance, zoomListener;
            
            instance = this;
            zoomListener = google.maps.event.addListener(this.map, "tilesloaded", function () {
               instance.map.setZoom(level);
               google.maps.event.removeListener(zoomListener);
            });
         },
         zoomOut : function (lat, lng) {
            var center = new google.maps.LatLng(lat, lng);
            this.map.setCenter(center);
            this.setZoom(this.ZOOM_OUT_LEVEL);
         },
         expandBounds : function (instance) {
            
            var lat = instance.getLat(),
                lng = instance.getLng(),
                lowerLatLng = new google.maps.LatLng(lat - 0.2, lng - 0.2),
                upperLatLng = new google.maps.LatLng(lat + 0.2, lng + 0.2),
                newBounds = new google.maps.LatLngBounds(lowerLatLng, upperLatLng);
            
            this.map.fitBounds(newBounds);
         },
         getPanorama : function () {
            return this.streetview;
         },
         /**
          * @description Takes an array of markers and resizes + pans the map so all places markers are visible. It does not show/hide marker.
          */
         fit : function (markersinfo) {
            var LatLngList = [], i, len, bounds, LtLgLen, minfo;
            markersinfo = markersinfo || this.markersinfo;
            this.markersinfo = markersinfo;
            
            
            for (i = 0, len = markersinfo.length; i < len; ++i) {
               minfo = markersinfo[i];
               LatLngList.push(new google.maps.LatLng(minfo.lat, minfo.lng));
            }
            // create a new viewpoint bound
            bounds = new google.maps.LatLngBounds();
            
            // go through each...
            for (i = 0,  LtLgLen = LatLngList.length; i < LtLgLen; ++i) {
               // And increase the bounds to take this point
               bounds.extend(LatLngList[i]);
            }
            // fit these bounds to the map
            this.map.fitBounds(bounds);
            
            if (markersinfo.length < 2) {
               this.map.setZoom(10);
            }
         },
         getOverlay : function () {
            return this.overlay;
         },
         getZoom : function () {
            return this.map.getZoom();
         },
         getProjection : function () {
            return this.map.getProjection();
         },
         getBounds : function () {
            return this.map.getBounds();
         },
         /**
          @public
          */
         enable : function () {
            
            this.setMapCursor();
            this.map.setOptions({
               draggable : true,
               scrollwheel : true,
               keyboardShortcuts : true
               //         mapTypeControl : true,
               //         panControl : true,
               //         zoomControl : true,
               //         streetViewControl : true
            });
         },
         /**
          * @public
          */
         disable : function () {
            
            this.setMapCursor("not-allowed");
            this.map.setOptions({
               draggable : false,
               scrollwheel : false,
               keyboardShortcuts : false
               //        mapTypeControl : false,
               //        panControl : false,
               //        zoomControl : false,
               //        streetViewControl : false
            });
         },
         /**
          * @description Wraps the google.maps.LatLng constructor
          */
         createLatLng : function (lat, lng) {
            return new google.maps.LatLng(lat, lng);
         },
         setMapCursor : function (style) {
            
            if (!style) {
               style = "crosshair";
            }
            this.map.setOptions({
               draggableCursor: style,
               draggingCursor: "move"
            });
          },
         /**
          * @description Set google map bounds to show a big part of the world.
          */
         showWorld : function () {
            
            var lowerLatLng, upperLatLng, newBounds;
            
            lowerLatLng = new google.maps.LatLng(-50, -90);
            upperLatLng = new google.maps.LatLng(50, 90);
            newBounds = new google.maps.LatLngBounds(lowerLatLng, upperLatLng);
            this.map.fitBounds(newBounds);
         },
         setMessage : function (message, options) {
            if (options) {
               this.infotext.setOption(options);
            }
            this.infotext
               .setMessage(message)
               .start();
         },
         toggleMessage : function (noMarker) {
            if (noMarker) {
               this.infotext.open();
            } else {
               this.infotext.close();
            }
         },
         
         /* ---------------------------------------- */
         /* ------- Marker specific methods -------- */
         
         /**
          @public
          @param {Marker} marker
          */
         centerMarker : function (markerView) {
            
            this.map.setZoom(ZOOM_LEVEL_CENTERED);
            this.map.panTo(markerView.getMarker().getPosition());
            communicator.publish("centered:marker", markerView.getPresenter());
         },
         /**
          * @public
          * @summary This roughly implements a Factory pattern. google.maps.Marker must only be instantiated through this method.
          * @returns {Marker}
          */
         createMarker : function (data) {
            assertTrue((data.lat && (data.lng || data.lon) && data.title), "input parameter data has to contain: lat, lng/lon, and title");
            assertTrue(data.getType() === "Place" || data.getType() === "Album", "model has to be either place or album");
            
            var lat = parseFloat(data.lat),
                lng = (isNaN(parseFloat(data.lon))) ? parseFloat(data.lng) : parseFloat(data.lon),
                markerIsPlace = (data.getType() === "Place"),
                icon =  markerIsPlace ? PLACE_DEFAULT_ICON : ALBUM_DEFAULT_ICON,
                iconWidth = markerIsPlace ? PLACE_ICON_WIDTH : ALBUM_ICON_WIDTH,
                iconHeight = markerIsPlace ? PLACE_ICON_HEIGHT : ALBUM_ICON_HEIGHT,
                shadowWidth = markerIsPlace ? PLACE_ICON_SHADOW_WIDTH : ALBUM_ICON_SHADOW_WIDTH,
                shadowIcon = markerIsPlace ? PLACE_SHADOW_ICON : ALBUM_SHADOW_ICON;
            
            assertTrue(isFinite(lat) && isFinite(lng), "lat and lng must not be infinite");
            
            // lng = parseFloat(lng);
            
            return new google.maps.Marker({
               position : new google.maps.LatLng(lat, lng),
               map : this.map,
               // icon :  new google.maps.MarkerImage(MARKER_DEFAULT_ICON),
               icon : {
                  url : icon,
                  scaledSize : new google.maps.Size(iconWidth, iconHeight, "px", "px")
               },
               shadow : {
                  url : shadowIcon,
                  anchor : new google.maps.Point(shadowWidth - iconWidth, iconHeight),
                  scaledSize : new google.maps.Size(shadowWidth, iconHeight, "px", "px")
               },
               title : data.title
            });
         },
         /**
          * @public
          * @param {Marker} marker
          * @param {String} event
          * @param {Function} callback
          */
         addListenerToMarker : function (marker, event, callback) {
            assertTrue(event && callback, "input parameters event and callback must not be undefined");
            
            google.maps.event.addListener(marker.getImplementation(), event, callback);
         },
         triggerEventOnMarker : function (marker, event) {
            google.maps.event.trigger(marker.getImplementation(), event);
         },
         
         /* -------------------------------------------------- */
         /* ---------- listener and private methods ---------- */
         bindClickListener : function (callback) {
            var instance = this;
            
            google.maps.event.addListener(this.map, "click", function (event) {
               communicator.publish("clicked:Map", {
                  lat : parseFloat(event.latLng.lat()),
                  lng : parseFloat(event.latLng.lng())
               });
            });
         },
         /**
          * @description Initialize the google maps instance with streetview.
          * @private
          */
         _create : function () {
            
            this.map = new google.maps.Map(this.$mapEl[0], this.mapOptions);
            this.maptype = google.maps.MapTypeId.ROADMAP;
            this.SATELLITE =  google.maps.MapTypeId.SATELLITE;
            this.ROADMAP = google.maps.MapTypeId.ROADMAP;
            // get hold of the default google.maps.StreetView object
            this.streetview = this.map.getStreetView();
            //define overlay to retrieve pixel position on mouseover event
            this.overlay = new google.maps.OverlayView();
            this.overlay.draw = function () {};
            this.overlay.setMap(this.map);
         },
         _bindKeyboardListener : function () {
            
            var instance = this;
            
            $("body")
               .on("keyup.Map", null, "return", function () {
                  if (instance.active) {
                     instance.presenter.triggerDblClickOnMarker(this.presenter.getSelectedMarker());
                  }
               });
         }
      });
      
      // _instance = new MapView();
      // singleton
      return MapView;
   });
