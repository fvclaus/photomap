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
      return this.getGallery();
   },
   getFullscreen : function () {
      return this.fullscreen;
   },
   getSlideshow : function () {
      return this.getSlideshow();
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
      return this.getState();
   },
   getInput : function () {
      return this.input;
   },
   getPanel : function () {
      return this.panel;
   },
   deletePlace : function () {
      if (main.getUIState().getCurrentPlace() != main.getUIState().getCurrentLoadedPlace()){
         return;
      }
      else{
         $("#mp-album").hide();
         this.information.hideDescription();
         $(".mp-place-title, .mp-gallery").empty();
         this.controls.hideEditControls();
         $.mask.close();
      }
   },
   /*
    * @description This should provide one method to disable the whole GUI
    */
   disable : function () {
      this.album.disableGallery();
      var places = main.getUIState().getPlaces();
      this._isDisabled = true;
      //TODO: disabled the 'cross' cursor on the map
      places.forEach(function (place) {
         place.showDisabledIcon();
      });
   },
   isDisabled : function () {
      return this._isDisabled;
   },

   enable : function () {
      this.album.enableGallery();
      var places = main.getUIState().getPlaces();
      this._isDisabled = false;
      //TODO: enable the 'cross' cursor on the map
      places.forEach(function (place) {
         place.checkIconStatus();
      });
   }
};
