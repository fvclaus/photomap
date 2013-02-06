/*jslint */
/*global $, main, UITools, UIState, UIControls, UIInput, UIInformation, UIGallery, UISlideshow, UIFullscreen, Place, Photo, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY */

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
    * @description Adds place fully to ui.
    */
   insertPlace : function (lat, lon, data) {
      
      //create new place and show marker
      //new place accepts only lon, because it handles responses from server
      var place = new Place({
         lat: lat,
         lon: lon,
         id : data.id,
         title : this.getState().retrieve(TEMP_TITLE_KEY),
         description : this.getState().retrieve(TEMP_DESCRIPTION_KEY)
      });
      place.show();
      this.getState().addPlace(place);
      this.getControls().bindPlaceListener(place);
      //TODO triggerDoubleClick does not respond, because the UI is still disabled at that point
      place.openPlace();
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
    * Adds photo fully to ui.
    */
   insertPhoto : function (data) {
      
      // add received value to uploadedPhoto-Object, add the photo to current place and restart gallery
      var state = this.getState(),
         photo = new Photo({
            id : data.id,
            photo : data.url,
            thumb : data.thumb,
            order : state.getPhotos().length,
            title : state.retrieve(TEMP_TITLE_KEY),
            description : state.retrieve(TEMP_DESCRIPTION_KEY)
         });
      state.getCurrentLoadedPlace().insertPhoto(photo);
      state.insertPhoto(photo);
      this.gallery.insertPhoto(photo);
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
      this.getGallery().deletePhoto(photo);
      this.getState().deletePhoto(photo);
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
