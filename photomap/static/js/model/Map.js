/*jslint */
/*global $, google, main, Place, Album, ALBUM_VIEW, DASHBOARD_VIEW, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY*/

"use strict";

/**
 * @author: Frederik Claus
 * @description: Facade for google maps
 */

var Map, state, page, authorized, center, lat, lng;

Map = function () {
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
      mapTypeControl : state.isInteractive(),
      mapTypeControlOptions : {
         style : google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
         position : google.maps.ControlPosition.TOP_LEFT
      },
      panControl : state.isInteractive(),
      panControlOptions : {
         position : google.maps.ControlPosition.TOP_LEFT
      },
      zoomControl : state.isInteractive(),
      zoomControlOptions : {
         style : google.maps.ZoomControlStyle.SMALL,
         position : google.maps.ControlPosition.TOP_LEFT
      },
      streetViewControl : state.isInteractive(),
      streetViewControlOptions : {
         position : google.maps.ControlPosition.TOP_LEFT
      },
      disableDoubleClickZoom : true
   };

   // mode : fullscreen || normal
   this.mode = 'normal';
   this._create();

};


Map.prototype = {

   initWithoutAjax : function () {
      this._create();
   },
   initAfterAjax : function () {
      
      var authorized;
      page = main.getUIState().getPage();
      
      if (page === ALBUM_VIEW) {
         authorized = main.getClientState().isAdmin();
         //TODO: gueststyle is broken. It won't display any gmap tiles ever. 
         if (authorized) {
            this.bindListener();
         }
      } else if (page === DASHBOARD_VIEW) {
         this.bindListener();
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
      this.streetview = this.getInstance().getStreetView();
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
      } else if (main && main.getUIState && main.getUIState().isInteractive()) {
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

      if (instance.model === undefined) {
         lat = instance.lat;
         lng = instance.lon;
      } else {
         lat = instance.getLat();
         lng = instance.getLng();
      }
      lowerLatLng = new google.maps.LatLng(lat - 0.2, lng - 0.2);
      upperLatLng = new google.maps.LatLng(lat + 0.2, lng + 0.2);
      newBounds = new google.maps.LatLngBounds(lowerLatLng, upperLatLng);
      this.map.fitBounds(newBounds);
   },
   getInstance : function () {
      return this.map;
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
   enable : function () {
      
      this._setMapCursor();
      this.map.setOptions({
         draggable : true,
         scrollwheel : true,
         keyboardShortcuts : true,
         mapTypeControl : true,
         panControl : true,
         zoomControl : true,
         streetViewControl : true
      });
   },
   disable : function () {
      
      this._setMapCursor("not-allowed");
      this.map.setOptions({
         draggable : false,
         scrollwheel : false,
         keyboardShortcuts : false,
         mapTypeControl : false,
         panControl : false,
         zoomControl : false,
         streetViewControl : false
      });
   },
   /* --- Listeners --- */
   
   bindListener : function () {
      var instance = this, state = main.getUIState();
      page = state.getPage();

      this.places = [];
      this.albums = [];

      this._bindClickListener();

   },

   /**
    * @private
    */
   _bindClickListener : function () {

      var input, lat, lng, place, album;

      google.maps.event.addListener(this.map, "click", function (event) {
         if (!main.getUI().isDisabled()) {
            
            //create new place with description and select it
            if (!state.isDashboard()) {
               
               input = main.getUI().getInput();
               lat = event.latLng.lat();
               lng = event.latLng.lng();
               
               input.onAjax(function (data) {
                  
                  //create new place and show marker
                  //new place accepts only lon, because it handles responses from server
                  place = new Place({
                     lat: lat,
                     lon: lng,
                     id : data.id,
                     "title" : state.retrieve(TEMP_TITLE_KEY),
                     "description" : state.retrieve(TEMP_DESCRIPTION_KEY)
                  });
                  place.show();
                  state.addPlace(place);
                  main.getUI().getControls().bindPlaceListener(place);
                  //redraws place
                  place.triggerDoubleClick();
                  
               });
               
               input.onLoad(function () {
                  var title, description;
                  $("input[name=lat]").val(lat);
                  $("input[name=lon]").val(lng);
                  $("input[name=album]").val(main.getUIState().getCurrentLoadedAlbum().id);
                  
                  input.onForm(function () {
                     //get place name + description
                     title = $("[name=title]").val();
                     description = $("[name=description]").val();
                     //dont create place yet, server might return error
                     state.store(TEMP_TITLE_KEY, title);
                     state.store(TEMP_DESCRIPTION_KEY, description);
                  });
               });
               
               input.get("/insert-place");
            } else {
               
               // create a new album
               input = main.getUI().getInput();
               lat = event.latLng.lat();
               lng = event.latLng.lng();
               
               input.onAjax(function (data) {
                  
                  //create new album and show marker
                  album = new Album({
                     lat: lat,
                     lon: lng,
                     id : data.id,
                     "title" : state.retrieve(TEMP_TITLE_KEY),
                     "description" : state.retrieve(TEMP_DESCRIPTION_KEY)
                  });
                  album.show();
                  state.addAlbum(album);
                  main.getUI().getControls().bindAlbumListener(album);
                  //redirect to new albumview
                  album.triggerDoubleClick();
               });
               
               input.onLoad(function () {
                  $("input[name=lat]").val(lat);
                  $("input[name=lon]").val(lng);
                  
                  input.onForm(function () {
                     //get album name + description
                     var title = $("[name=title]").val(), description = $("[name=description]").val();
                     //dont create album yet, server might return error
                     state.store(TEMP_TITLE_KEY, title);
                     state.store(TEMP_DESCRIPTION_KEY, description);
                  });
               });
               
               input.get("/insert-album");
            }
         }
      });
   },
};
