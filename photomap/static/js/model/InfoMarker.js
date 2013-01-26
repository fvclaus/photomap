/*jslint */
/*global $, main, google, Marker, ZOOM_LEVEL_CENTERED, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON */

"use strict";

/*
 * @author Frederik Claus
 * @class Base class for both Album and Place.
 */

var InfoMarker;

InfoMarker = function (data) {
   
   this.model = data.model;
   this.title = data.title;
   this.id = data.id;
   this.description = data.description;
   this.lat = data.lat;
   this.lng = data.lon;


   // this.marker = main.getMap().createMarker({
   //    lat : parseFloat(data.lat),
   //    lng : parseFloat(data.lon),
   //    title : this.title
   // });
   // this.marker = new Marker({
   //    lat: parseFloat(data.lat),
   //    lng: parseFloat(data.lon),
   //    title: this.title
   // }); 
   this.map = main.getMap();
   //generate a new Marker from the Map object
   this.setImplementation(this.map.createMarker(data));
   this.hide();

};

InfoMarker.prototype = {
   /**
    * @public
    * @description Shows the album on the map
    */
   show : function () {
      this.map.showMarker(this);
   },
   /**
    @public
    */
   hide : function () {
      this.map.hideMarker(this);
   },
   /**
    @public
    */
   center : function () {
      this.map.center(this);
   },

   getPosition : function () {
      return this.MapMarker.getPosition();
   },
   getSize : function () {
      return this.MapMarker.getIcon().size;
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
    @private
    @summary Used by the Map to set the used Marker instance
    */
   getImplementation : function () {
      return this.MapMarker;
   },
   /**
    @private
    @summary Used by the Map to retrieve the used Marker instance
    */
   setImplementation : function (implementation) {
      this.MapMarker =  implementation;
   },
   getModel : function () {
      return this.model;
   },
   getLat : function () {
      return this.lat;
   },
   getLng : function () {
      return this.lng;
   },
   getLatLng : function () {
      var map = main.getMap();
      return map.createLatLng(this.getLat(), this.getLng());
   },
   /**
    @public
    */
   setCursor : function (cursor) {
      this.MapMarker.setCursor(cursor);
   },
   triggerClick : function () {
      this.map.triggerClickOnMarker(this);
   },
   triggerDoubleClick : function () {
      this.map.triggerDblClickOnMarker(this);
   },

   showVisitedIcon : function () {
      this._setOption({icon: PLACE_VISITED_ICON});
   },
   showSelectedIcon : function () {
      this._setOption({icon: PLACE_SELECTED_ICON});
   },
   showUnselectedIcon : function () {
      this._setOption({icon: PLACE_UNSELECTED_ICON});
   },
   showDisabledIcon : function () {
      this._setOption({icon: PLACE_DISABLED_ICON});
   },

   /**
    @private
    */
   _setOption : function (options) {
      if (typeof options.icon !== 'undefined') {
         this.MapMarker.setIcon(new google.maps.MarkerImage(options.icon));
      }
      if (typeof options.zindex !== 'undefined') {
         this.MapMarker.setZIndex(options.zindex);
      }
   },
};
