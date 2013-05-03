/*jslint */
/*global $, define, google, main,  ALBUM_VIEW, DASHBOARD_VIEW, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, MARKER_DEFAULT_ICON, ZOOM_LEVEL_CENTERED, SHADOW_ICON, MARKER_ICON_WIDTH, MARKER_ICON_HEIGHT, MARKER_ICON_SHADOW_WIDTH, assert, assertTrue  */

"use strict";

/**
 * @author: Frederik Claus
 * @description: Facade for google maps
 */

define([
   "dojo/_base/declare",
   "view/View",
   "presenter/MapPresenter",
   "util/Communicator",
   "util/ClientState",
   "view/MarkerView",
   "ui/UIState",
   "dojo/domReady!"
   ],
    function (declare, View, MapPresenter, communicator, clientstate, MarkerView, state) {
       var MapView = declare(View, {
          constructor : function () {
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

             // mode : fullscreen || normal
             this.mode = 'normal';
             this.presenter = new MapPresenter(this);
             this.markers = [];
             this._create();
             communicator.subscribeOnce("init", this._init, this);
          },
          storeCurrentState : function () {
             var instance = this;
             
             this.storedState =  {
                zoom: instance.map.getZoom(),
                center: instance.map.getCenter(),
                type: instance.map.getMapTypeId()
             }
          },
          store : function (property, value) {
            this.storedState[property] = value; 
          },
          restoreSavedState : function () {
             
             this.map.setMapTypeId(this.storedState.type);
             this.map.setZoom(this.storedState.zoom);
             this.map.panTo(this.storedState.center);
          },
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
           @public
           @param {Marker} marker
           */
          centerMarker : function (marker) {
             
             this.map.setZoom(ZOOM_LEVEL_CENTERED);
             this.map.panTo(marker.getPosition());
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
          /**
           * @public
           * @summary This roughly implements a Factory pattern. google.maps.Marker must only be instantiated through this method.
           * @returns {Marker}
           */
          createMarker : function (data) {
             assertTrue((data.lat && (data.lng || data.lon) && data.title), "input parameter data has to contain: lat, lng/lon, and title");
             
             var lat = parseFloat(data.lat),
                 lng = (isNaN(parseFloat(data.lon))) ? parseFloat(data.lng) : parseFloat(data.lon);

             assertTrue(isFinite(lat) && isFinite(lng), "lat and lng must not be infinite");

             // lng = parseFloat(lng);

             return new google.maps.Marker({
                position : new google.maps.LatLng(lat, lng),
                map : this.map,
                // icon :  new google.maps.MarkerImage(MARKER_DEFAULT_ICON),
                icon : {
                   url : MARKER_DEFAULT_ICON,
                   scaledSize : new google.maps.Size(MARKER_ICON_WIDTH, MARKER_ICON_HEIGHT, "px", "px")
                },
                shadow : {
                   url : SHADOW_ICON,
                   anchor : new google.maps.Point(MARKER_ICON_SHADOW_WIDTH - MARKER_ICON_WIDTH, MARKER_ICON_HEIGHT),
                   scaledSize : new google.maps.Size(MARKER_ICON_SHADOW_WIDTH, MARKER_ICON_HEIGHT, "px", "px")
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
          getInstance : function () {
             throw new Error("DoNotUseThisError");
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
             
             this._setMapCursor();
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
             
             this._setMapCursor("not-allowed");
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
          triggerEventOnMarker : function (marker, event) {
             google.maps.event.trigger(marker.getImplementation(), event);
          },
          //TODO this is a bit messy.. there must be a better way to do this!
          _init : function (data) {
             
             var authorized, init, instance = this;
             
             init = function () {
                
                console.log("in map init");
                if (state.isAlbumView()) {
                   authorized = clientstate.isAdmin();
                   
                   if (state.getMarkers().length <= 0) {
                      this.expandBounds(state.getCurrentLoadedAlbum());
                   } else {
                      this._showMarkers(state.getMarkers());
                   }
                   
                   //TODO: gueststyle is broken. It won't display any gmap tiles ever. 
                   if (authorized) {
                      this._bindClickListener();
                   }
                } else if (state.isDashboardView()) {
                   if (state.getMarkers().length <= 0) {
                      this._showWorld();
                   } else {
                      this._showMarkers(state.getMarkers());
                   }
                   this._bindClickListener();
                }
                // set map options if interactive
                this.map.setOptions(this.mapOptions);
                this._setMapCursor();
             };
             
             instance.presenter.insertMarkers(data, init);
          },
          //TODO this is a mess.. MapView is accessing MarkerView and MarkerPresenter.. changes to a View should be done only by its Presenter!
          _showMarkers : function (markers) {

             var markersInfo = [];
             
             console.log(markers);

             if (markers.length === 1) {
                markers[0].show();
                console.log('_-------------------_');
                console.log(markers[0]);
                this.expandBounds(markers[0]);
             } else {
                markers.forEach(function (marker) {
                   marker.show();
                   markersInfo.push({
                      lat : marker.getLat(),
                      lng : marker.getLng()
                   });
                });
                this.fit(markersInfo);
             }
          },
          /**
           * @description Set google map bounds to show a big part of the world.
           */
          _showWorld : function () {

             var lowerLatLng, upperLatLng, newBounds;

             lowerLatLng = new google.maps.LatLng(-50, -90);
             upperLatLng = new google.maps.LatLng(50, 90);
             newBounds = new google.maps.LatLngBounds(lowerLatLng, upperLatLng);
             this.map.fitBounds(newBounds);
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
             this._bindClickListener();
          },
          _setMapCursor : function (style) {
             
             if (!style) {
                style = "cross";
             }
             this.map.setOptions({
                draggableCursor: style,
                draggingCursor: "move"
             });
          },
          _bindClickListener : function (callback) {
             var instance = this;

             google.maps.event.addListener(this.map, "click", function (event) {
                instance.presenter.click({
                   lat : parseFloat(event.latLng.lat()),
                   lng : parseFloat(event.latLng.lng())
                });
             });
          },
          _bindCenterChangeListener : function () {
             var instance = this;
             
             google.maps.event.addListener(this.map, "center_changed", function (event) {
                instance.presenter.centerChanged();
             });
          }
       });
                             
           // _instance = new MapView();
       // singleton
       return MapView;
    });
