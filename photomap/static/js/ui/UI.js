/*jslint */
/*global $, main, UIMap, UITools,  UIState, UIControls, UIInput, UIInformation, DASHBOARD_VIEW, Album, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY */

"use strict";

/**
 * @author Frederik Claus
 * @class UI is a wrapper class for everything that is visible to the user
 * @requires UITools, UIControls, UIInput, UIState, UIInformation
 *
 */

var UI, state, albums;

UI = function () {
   this.tools = new UITools();
   this.controls = new UIControls();
   this.input = new UIInput();
   this.state = new UIState(this);
   if (this.state.getPage() === DASHBOARD_VIEW) {
      this.information = new UIInformation();
   }
   this._isDisabled = false;
};

/**
 * @author Marc Roemer
 * @description Defines Getter to retrieve the UI classes wrapped, handler to add/remove object to/from ui and to en-/disable the ui completely
 */

UI.prototype = {
   /**
    * @author Frederik Claus
    * @description Initializes all UI Classes that need initialization after(!) every object is instantiated
    */
   initWithoutAjax : function () {
      this.controls.initWithoutAjax();
   },
   initAfterAjax : function () {
      this.controls.initAfterAjax();
   },
   getTools : function () {
      return this.tools;
   },
   getControls : function () {
      return this.controls;
   },
   getInput : function () {
      return this.input;
   },
   getState: function () {
      return this.state;
   },
   getInformation: function () {
      return this.information;
   },
   /**
    * @description Propagates the addAlbum event to every UI component affected.
    */
   addAlbum : function (lat, lon, data) {
      
      //create new album and show marker
      var album = new Album({
         lat: lat,
         lon: lon,
         id : data.id,
         title : this.getState().retrieve(TEMP_TITLE_KEY),
         description : this.getState().retrieve(TEMP_DESCRIPTION_KEY)
      });
      album.show();
      this.getState().insertAlbum(album);
      this.getControls().bindAlbumListener(album);
      //redirect to new albumview
      //triggerDoubleClick does not work on the time, because the UI is still disabled from UIInput
      album.openURL();
   },
   /**
    * @description Removes album fully from ui.
    */
   removeAlbum : function (id) {
      
      var album = this.getTools().getObjectByKey("id", id, this.getState().getAlbums());
      
      if (album === this.getState().getCurrentLoadedAlbum()) {
         this.getInformation().removeDescription();
      }
      album.hide();
      this.getState().removeAlbum(album);
   },
   showLoading : function () {
      this.getTools().loadOverlay($("#mp-ui-loading"), true);
      this.getTools().fitMask();
      $("body, a, .mp-logo img").css("cursor", "progress");
   },
   hideLoading : function () {
      this.getTools().closeOverlay($("#mp-ui-loading"));
      $("body, a, .mp-logo img").css("cursor", "");
   },
   disable : function () {
      
      var albums;
      albums = main.getUIState().getAlbums();
      
      this._isDisabled = true;
      albums.forEach(function (album) {
         album.showDisabledIcon();
         album.setCursor("not-allowed");
      });
      $("a, .mp-control").css({
//         opacity: 0.4,
         cursor: "not-allowed"
      });
      $("a").on("click.Disabled", function (event) {
         event.preventDefault();
         event.stopPropagation();
      });
      main.getMap().disable();
   },
   isDisabled : function () {
      return this._isDisabled;
   },
   enable : function () {

      var albums;
      albums = main.getUIState().getAlbums();
      this._isDisabled = false;
      albums.forEach(function (album) {
         album.checkIconStatus();
         album.setCursor("");
      });
      $("a, .mp-control").css({
//         opacity: 1,
         cursor: ""
      });
      $("a").off(".Disabled");
      main.getMap().enable();
   }
};
