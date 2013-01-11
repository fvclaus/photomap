/*global $, main, UITools,  UIState, UIControls, UIPanel, UIInput, UICursor, UIInformation, UIGallery, UISlideshow, UIFullscreen */
/*
 * @author Frederik Claus
 * @class UI is a facade for all other UI classes
 */

"use strict";

var UI;

UI = function () {
   this.state = new UIState();
   this.tools = new UITools();
   this.information = new UIInformation();
   this.panel = new UIPanel();
   this.controls = new UIControls();
   this.gallery = new UIGallery();
   this.slideshow = new UISlideshow();
   this.fullscreen = new UIFullscreen();
   this.input = new UIInput();
   this.cursor = new UICursor();
   this._isDisabled = false;
};



UI.prototype = {

   initWithoutAjax : function () {
      this.slideshow.initWithoutAjax();
      this.information.initWithoutAjax();
      this.panel.initWithoutAjax();
      this.controls.initWithoutAjax();
      this.cursor.initWithoutAjax();
      this.tools.initWithoutAjax();
   },
   initAfterAjax : function () {
      this.panel.initAfterAjax();
      this.controls.initAfterAjax();
      this.gallery.initAfterAjax();
      this.cursor.initAfterAjax();
   },
   getCursor : function () {
      return this.cursor;
   },
   getGallery : function () {
      return this.gallery;
   },
   getFullscreen : function () {
      return this.fullscreen;
   },
   getSlideshow : function () {
      return this.slideshow;
   },
   getTools : function () {
      return this.tools;
   },
   getControls : function () {
      return this.controls;
   },
   getInformation : function () {
      return this.information;
   },
   getState : function () {
      return this.state;
   },
   getInput : function () {
      return this.input;
   },
   getPanel : function () {
      return this.panel;
   },
   deletePlace : function () {
      if (main.getUIState().getCurrentPlace() === main.getUIState().getCurrentLoadedPlace()) {
   
       // do sth here!
      }
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
