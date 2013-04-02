/*jslint */
/*global $, main, google, Marker, ZOOM_LEVEL_CENTERED, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON, MarkerPresenter */

"use strict";

/*
 * @author Frederik Claus
 * @class Base class for both Album and Place.
 */

var InfoMarker = function (data) {
   
   this.model = data.model;
   this.title = data.title;
   this.id = data.id;
   // reading from input elements will return '' if nothing has been entered
   this.description = (data.description === "")? null : data.description;
   this.lat = data.lat;
   this.lng = data.lon;

   this.map = main.getMap();
   // generate a new Marker from the Map object
   this.setImplementation(this.map.createMarker(data));
   // show only when requested
   this.hide();
   this.presenter = new MarkerPresenter(this);
   this._bindMarkerListener();
};

InfoMarker.prototype = {
   /**
    * @public
    * @description Shows the Marker on the Map
    */
   show : function () {
      this.map.showMarker(this);
   },
   /**
    * @public
    * @description Hides the Marker on the Map
    */
   hide : function () {
      this.map.hideMarker(this);
   },
   /**
    * @public
    * @description Centers the Map on the Marker
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
    @public
    @summary Used by the Map to get the Marker instance
    */
   getImplementation : function () {
      return this.MapMarker;
   },
   /**
    * @public
    * @summary Used by the Map to set the Marker instance
    * @param {MarkerClass} implementation Concrete implementation of a marker class, eg. google.maps.MapMarker
    */
   setImplementation : function (implementation) {
      this.MapMarker =  implementation;
   },
   /**
    * @public
    * @returns {String} Name of this model
    */
   getModel : function () {
      return this.model;
   },
   /**
    * @public
    * @returns {float} Latitude
    */
   getLat : function () {
      return this.lat;
   },
   /**
    * @public
    * @returns {float} Longitude
    */
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
   triggerMouseOver : function () {
      this.presenter.mouseOver();
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
   }
};
