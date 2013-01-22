/*global $, main, UITools, UIState, UIControls, UIInput, UIInformation, UIGallery, UISlideshow, UIFullscreen */
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
   this.controls = new UIControls();
   this.gallery = new UIGallery();
   this.slideshow = new UISlideshow();
   this.fullscreen = new UIFullscreen();
   this.input = new UIInput();
   this._isDisabled = false;
};



UI.prototype = {

   initWithoutAjax : function () {
      this.slideshow.initWithoutAjax();
      this.information.initWithoutAjax();
      this.controls.initWithoutAjax();
      this.tools.initWithoutAjax();
   },
   initAfterAjax : function () {
      this.controls.initAfterAjax();
      this.gallery.initAfterAjax();
      this.information.initAfterAjax();
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
   deletePlace : function (place) {
      if (place === main.getUIState().getCurrentLoadedPlace()) {
         
         this.getGallery().show();
         this.getSlideshow().removeCurrentImage();
         this.getInformation().updateAlbum();
      }
      //TODO private function call
      place._delete();
   },
   showLoading : function () {
      main.getUI().getTools().loadOverlay($("#mp-ui-loading"), true);
      main.getUI().getTools().fitMask();
      $("body, a, .mp-logo img").css("cursor", "progress");
   },
   hideLoading : function () {
      main.getUI().getTools().closeOverlay($("#mp-ui-loading"));
      $("body, a, .mp-logo img").css("cursor", "");
   },
   disable : function () {
      
      var places;
      places = main.getUIState().getPlaces();
      
      this._isDisabled = true;
      places.forEach(function (place) {
         place.showDisabledIcon();
         place.getMarker().setCursor("not-allowed");
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
      
      var places;
      places = main.getUIState().getPlaces();
      this._isDisabled = false;
      places.forEach(function (place) {
         place.checkIconStatus();
         place.getMarker().setCursor("");
      });
      $("a, .mp-control").css({
//         opacity: 1,
         cursor: ""
      });
      $("a").off(".Disabled");
      main.getMap().enable();
   }
};
