/*jslint */
/*global $, main, google, MARKER_DEFAULT_ICON */

"use strict";

/**
 * @author Frederik Claus
 * @class Wraps a google.maps.Marker
 * @summary Marker is totally dependent on UIMap. It must delegate must functions to the UIMap.
 */

var Marker;

Marker = function (data, map) {
   this.model = 'Marker';
   this.map  = map;

   this._create(data);
};

Marker.prototype = {
   /*
    * @private
    */
   _create : function (data) {
      // latitude and longitude
      this.lat = data.lat;
      this.lng = data.lng;
      // title
      this.title = data.title;
      // custom icons for the map markers
      // data.mapicon = new google.maps.MarkerImage(MARKER_DEFAULT_ICON);
      
      // this.MapMarker = map.createMarker(data); 
      // this.MapMarker = new google.maps.Marker({
      //    position : new google.maps.LatLng(this.lat, this.lng),
      //    map : map.getInstance(),
      //    icon : this.mapicon,
      //    title : this.title
      // });
      // don't show for now
      // this.MapMarker.setMap(null);
      this.map.hideMarker(this);

   },
   show : function () {
      // this.MapMarker.setMap(map.getInstance());
      this.map.hideMarker(this);
   },
   hide : function () {
      this.MapMarker.setMap(null);
   },
   center : function () {
      this.map.center(this);
   },
   setOption : function (options) {
      if (typeof options.icon !== 'undefined') {
         this.MapMarker.setIcon(new google.maps.MarkerImage(options.icon));
      }
      if (typeof options.zindex !== 'undefined') {
         this.MapMarker.setZIndex(options.zindex);
      }
   },
   getPosition : function () {
      return this.MapMarker.getPosition();
   },
   getSize : function () {
      return this.MapMarker.getIcon().size;
   },
   addListener : function (event, callback) {
      this.map.addListenerToMarker(this, event, callback);
   },
   /**
    @private
    @summary Don't use this. This is only between the Map and the Marker
    */
   getImplementation : function () {
      return this.MapMarker;
   },
   /**
    @private
    @summary Don't use this. This is only between the Map and the Marker
    */
   setImplementation : function (gmarker) {
      this.MapMarker = gmarker;
   },

};

