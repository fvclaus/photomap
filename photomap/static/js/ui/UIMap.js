/*jslint */
/*global $, google, main, Place, Album, ALBUM_VIEW, DASHBOARD_VIEW, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, MARKER_DEFAULT_ICON, ZOOM_LEVEL_CENTERED, assert, assertTrue */

"use strict";

/**
 * @author: Frederik Claus
 * @description: Facade for google maps
 */

var UIMap, state, page, authorized, center, lat, lng, gmarker;

UIMap = function () {
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
   // map gets called as part of the Main.init() function, so everything is in place already
   state = main.getUIState();
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
   this._create();
};


UIMap.prototype = {
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
    * @summary This roughly implements a Factory pattern. google.maps.Marker must only be instantiated through this method.
    * @returns {Marker}
    */
   createMarker : function (data) {
      assertTrue((data.lat && (data.lng || data.lon) && data.title));
      
      lat = parseFloat(data.lat);
      lng = (isNaN(parseFloat(data.lon))) ? parseFloat(data.lng) : parseFloat(data.lon);

      assertTrue(isFinite(lat) && isFinite(lng));

      // lng = parseFloat(lng);

      gmarker =  new google.maps.Marker({
         position : new google.maps.LatLng(lat, lng),
         map : this.map,
         icon : new google.maps.MarkerImage(MARKER_DEFAULT_ICON),
         title : data.title
      });
      // marker.setImplementation(gmarker);
      return gmarker;
   },
   /**
    * @public
    * @param {Marker} marker
    */
   hideMarker : function (marker) {
      // marker.getImplementation().setMap(null);
      marker.getImplementation().setVisible(false);
   },
   /**
    @public
    @param {Marker} marker 
    */
   showMarker : function (marker) {
      // marker.getImplementation().setMap(this.map);
      marker.getImplementation().setVisible(true);
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
    * @param {Marker} marker
    * @param {String} event
    * @param {Function} callback
    */
   addListenerToMarker : function (marker, event, callback) {
      assertTrue(event && callback);

      google.maps.event.addListener(marker.getImplementation(), event, callback);
   },
   /**
    * @public
    * @param {Marker} marker
    */
   triggerClickOnMarker : function (marker) {
      this._triggerEventOnMarker(marker, "click");
   },
   /**
    * @public
    * @param {Marker} marker
    */
   triggerDblClickOnMarker : function (marker) {
      this._triggerEventOnMarker(marker, "dblclick");
   },
   triggerMouseOverOnMarker : function (marker) {
      this._triggerEventOnMarker(marker, "mouseover");
   },
   /**
    * @private
    */
   _triggerEventOnMarker : function (marker, event) {
      google.maps.event.trigger(marker.getImplementation(), event);
   },


   initWithoutAjax : function () {
      this._create();
   },
   initAfterAjax : function () {
      
      var authorized;
      
      if (main.getUIState().isAlbumView()) {
         authorized = main.getClientState().isAdmin();
         //TODO: gueststyle is broken. It won't display any gmap tiles ever. 
         if (authorized) {
            this._bindClickListener();
         }
      } else {
         this._bindClickListener();
      }
      // set map options if interactive
      this.map.setOptions(this.mapOptions);
      this._setMapCursor();
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
   /**
    * @description Wraps the google.maps.LatLng constructor
    */
   createLatLng : function (lat, lng) {
      return new google.maps.LatLng(lat, lng);
   },
   _setMapCursor : function (style) {
      
      var cursor;
      
      if (style) {
         cursor = style;
      } else if (main && main.getUIState) {
         // if no style is defined -> cross on interactive pages, else grabber
         cursor = "cross";
      } else {
         cursor = "move";
      }
      this.map.setOptions({
         draggableCursor: cursor,
         draggingCursor: "move"
      });
   },
   setZoom : function (level) {

      var instance, zoomListener;

      instance = this;
      zoomListener = google.maps.event.addListener(this.map, "tilesloaded", function () {
         instance.map.setZoom(level);
         google.maps.event.removeListener(zoomListener);
      });
   },
   showAsMarker : function (instances) {

      var markersInfo = [];

      if (instances.length === 1) {
         instances[0].show();
         console.log('_-------------------_');
         console.log(instances[0]);
         this.expandBounds(instances[0]);
      } else {
         instances.forEach(function (instance) {
            instance.show();
            markersInfo.push({
               lat : instance.getLat(),
               lng : instance.getLng()
            });
         });
         this.fit(markersInfo);
      }
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
   zoomOut : function (lat, lng) {
      center = new google.maps.LatLng(lat, lng);
      this.map.setCenter(center);
      this.setZoom(this.ZOOM_OUT_LEVEL);
   },
   expandBounds : function (instance) {

      var lowerLatLng, upperLatLng, newBounds;

      // if (instance.model === undefined) {
      //    lat = instance.lat;
      //    lng = instance.lon;
      // } else {
         lat = instance.getLat();
         lng = instance.getLng();
      // }
      lowerLatLng = new google.maps.LatLng(lat - 0.2, lng - 0.2);
      upperLatLng = new google.maps.LatLng(lat + 0.2, lng + 0.2);
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

   addClickListener : function (callback) {

      google.maps.event.addListener(this.map, "click", function (event) {
         callback.call(this, {
            lat : parseFloat(event.latLng.lat()),
            lng : parseFloat(event.latLng.lng())
         });
      });
   },

   /**
    * @private
    */
   //TODO i dont know if this belongs here
   _bindClickListener : function () {


   },
};
