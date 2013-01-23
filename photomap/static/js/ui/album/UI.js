/*jslint */
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

/**
 * @author Marc Roemer
 * @description Defines Getter to retrieve the UI classes wrapped, handler to add/remove object to/from ui and to en-/disable the ui completely
 */

UI.prototype = {

   initWithoutAjax : function () {
      this.slideshow.initWithoutAjax();
      this.controls.initWithoutAjax();
   },
   initAfterAjax : function () {
      this.controls.initAfterAjax();
      this.gallery.initAfterAjax();
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
   /**
    * @description Removes place fully from ui.
    */
   deletePlace : function (id) {
      
      var place = this.getTools().getObjectById(id, this.getState().getPlaces());

      if (place === this.getState().getCurrentLoadedPlace()) {
         
         this.getGallery().show();
         this.getSlideshow().removeCurrentImage();
         this.getInformation().removeDescription();
      }
      place.hide();
      this.getState().removePlace(place);
   },
   /**
    * @description Removes photo fully from ui.
    */
   deletePhoto : function (id) {
      
      var photo = this.getTools().getObjectById(id, this.state.getPhotos());
      
      if (photo === this.getState().getCurrentLoadedPhoto()) {
         
         this.getSlideshow().removeCurrentImage();
         this.getInformation().removeDescription();
      }
      this.getGallery().deleteImage(photo);
      this.getState().removePhoto(photo);
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
      
      var places;
      places = main.getUIState().getPlaces();
      
      this._isDisabled = true;
      places.forEach(function (place) {
         place.showDisabledIcon();
         place.setCursor("not-allowed");
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
         place.setCursor("");
      });
      $("a, .mp-control").css({
//         opacity: 1,
         cursor: ""
      });
      $("a").off(".Disabled");
      main.getMap().enable();
   }
};
