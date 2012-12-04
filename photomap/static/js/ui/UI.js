/*jslint */
/*global $, main, UITools,  UIState, UIControls, UIPanel, UIInput, UICursor, UIInformation */

"use strict";

/*
 * @author: Frederik Claus
 * @class UI is a wrapper class for everything related to the album div, where all the pictures are shown
 * @requires UITools, UIPanel, UIControls, UIInput, UIState, UICursor, UIInformation
 *
 */

var UI, state, albums;

UI = function () {
   this.tools = new UITools();
   this.panel = new UIPanel();
   this.controls = new UIControls();
   this.input = new UIInput();
   this.state = new UIState(this);
   this.cursor = new UICursor();
   this.information = new UIInformation();
   this._isDisabled = false;
};

/*
 * @author Marc Roemer
 * @description Defines Getter to retrieve the UI classes wrapped
 */

UI.prototype = {
   /*
    * @author Frederik Claus
    * @description Initializes all UI Classes that need initialization after(!) every object is instantiated
    */
   initWithoutAjax : function () {
      this.panel.initWithoutAjax();
      this.controls.initWithoutAjax();
      this.cursor.initWithoutAjax();
      this.tools.initWithoutAjax();
   },
   initAfterAjax : function () {
      this.panel.initAfterAjax();
      this.controls.initAfterAjax();
      this.cursor.initAfterAjax();
   },
   getCursor : function () {
      return this.cursor;
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
   getPanel : function () {
      return this.panel;
   },
   /*
    * @description This should disable the UI in a way that no manipulation is possible anymore
    */
   disable : function () {
      state = main.getUIState();
      this._isDisabled = true;
      //TODO: disabled the 'cross' cursor on the map
      albums = state.getAlbums();
      albums.forEach(function (album) {
         album.showDisabledIcon();
      });
   },
   isDisabled : function () {
      return this._isDisabled;
   },
   /*
    * @description This should enable the UI
    */
   enable : function () {
      state = main.getUIState();
      this._isDisabled = false;
      //TODO: enable the 'cross' cursor on the map
      var albums = state.getAlbums();
      albums.forEach(function (album) {
         album.checkIconStatus();
      });
   },
};
