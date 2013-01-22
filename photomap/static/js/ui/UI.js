/*jslint */
/*global $, main, UIMap, UITools,  UIState, UIControls, UIInput, UIInformation, DASHBOARD_VIEW */

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
 * @description Defines Getter to retrieve the UI classes wrapped
 */

UI.prototype = {
   /**
    * @author Frederik Claus
    * @description Initializes all UI Classes that need initialization after(!) every object is instantiated
    */
   initWithoutAjax : function () {
      this.controls.initWithoutAjax();
      this.tools.initWithoutAjax();
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
   /*
    * @description This should disable the UI in a way that no manipulation is possible anymore
    */
   disable : function () {
      
      var state, album;
      state = main.getUIState();
      albums = state.getAlbums();
      
      this._isDisabled = true;
      albums.forEach(function (album) {
         album.showDisabledIcon();
      });
      main.getUI().getTools().loadOverlay($("#mp-ui-loading"), true);
      main.getUI().getTools().fitMask();
   },
   isDisabled : function () {
      return this._isDisabled;
   },
   /*
    * @description This should enable the UI
    */
   enable : function () {
      
      var state, albums;
      state = main.getUIState();
      albums = state.getAlbums();
      this._isDisabled = false;
      //TODO: enable the 'cross' cursor on the map
      albums.forEach(function (album) {
         album.checkIconStatus();
      });
      main.getUI().getTools().closeOverlay($("#mp-ui-loading"));
   }
};
