/*jslint */
/*global $, main, UIMap, UITools,  UIState, ModelFunctionView, GalleryView, UISlideshow, UIInput, UIInformation, UIStatusMessage, DASHBOARD_VIEW, ALBUM_VIEW, Album, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, Photo, Place, PlacePresenter */

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
   this.controls = new ModelFunctionView();
   this.input = new UIInput();
   this.state = new UIState(this);
   this.information = new UIInformation();
   this.message = new UIStatusMessage();

   if (this.state.isAlbumView()) {
      this.gallery = new GalleryView();
      this.slideshow = new UISlideshow();
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
   preinit : function () {
      if (this.state.isAlbumView()){
         this.slideshow.preinit();
      }
   },
   init : function () {
      // decide which listener to bind
      this.controls.init();
      this.information.init();
      if (this.state.isAlbumView()){
         this.gallery.init();
      }
   },
   getGallery : function () {
      return this.gallery;
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
   getInput : function () {
      return this.input;
   },
   getState: function () {
      return this.state;
   },
   getInformation: function () {
      return this.information;
   },
   getMessage : function () {
      return this.message;
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
      this.getState().insertPlace(place);
      //TODO triggerDoubleClick does not respond, because the UI is still disabled at that point
      place.openPlace();
   },
   /**
    * @description Removes place fully from ui.
    */
   deletePlace : function (place) {
      this.getState().deletePlace(place);

      if (place === this.getState().getCurrentLoadedPlace()) {
         
         //TODO what was gallery.show()? shouldnt it be gallery.hide()?
         // this.getGallery().show();
         this.getGallery().reset();
         // this.getSlideshow().removeCurrentImage();
         this.getSlideshow().reset();
         this.getInformation().empty(place);
      }
      place.hide();

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
      this.getGallery().insertPhoto(photo);
      this.getSlideshow().insertPhoto(photo);
      // openPhoto() does not work now, because photo is not loaded yet
   },
   /**
    * @description Removes photo fully from ui.
    */
   deletePhoto : function (photo) {
      // we must update state first, all other components depend on it
      this.getState().getCurrentLoadedPlace().deletePhoto(photo);
      
      if (photo === this.getState().getCurrentLoadedPhoto()) {
         
         this.getInformation().empty(photo);
      }
      this.getSlideshow().deletePhoto(photo);
      this.getGallery().deletePhoto(photo);

   },
   /**
    * @description Propagates the addAlbum event to every UI component affected.
    */
   insertAlbum : function (lat, lon, data) {
      
      //create new album and show marker
      var album = new Album({
         lat: lat,
         lon: lon,
         id : data.id,
         title : this.getState().retrieve(TEMP_TITLE_KEY),
         description : this.getState().retrieve(TEMP_DESCRIPTION_KEY),
         secret : data.secret
      });
      album.show();
      this.getState().insertAlbum(album);
      //redirect to new albumview
      //triggerDoubleClick does not work on the time, because the UI is still disabled from UIInput
      album.openURL();
   },
   /**
    * @description Removes album fully from ui.
    */
   deleteAlbum : function (album) {
      this.getState().deleteAlbum(album);
      
      if (album === this.getState().getCurrentLoadedAlbum()) {
         this.getInformation().empty(album);
      }
      album.hide();
   },
   // loader should (maybe) be placed over the ui-element which is currently loading.
   // loader is sometimes called twice in a row (slideshow.navigate followed by gallery.checkslider)
   // so loader might disappear and then suddenly milliseconds later appear again, which might confuse many users!
   //TODO place in individual class. this is likely to change
   // showLoading : function () {
   //    this.getTools().loadOverlay($("#mp-ui-loading"), true);
   //    this.getTools().fitMask();
   //    $("body, a, .mp-logo img").css("cursor", "progress");
   // },
   // hideLoading : function () {
   //    this.getTools().closeOverlay($("#mp-ui-loading"));
   //    $("body, a, .mp-logo img").css("cursor", "");
   // },
   disable : function () {
      var models = this._getModels();

      this._isDisabled = true;
      models.forEach(function (model) {
         model.showDisabledIcon();
         model.setCursor("not-allowed");
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
      var models = this._getModels();

      this._isDisabled = false;
      models.forEach(function (model) {
         model.checkIconStatus();
         model.setCursor("");
      });
      $("a, .mp-control").css({
//         opacity: 1,
         cursor: ""
      });
      $("a").off(".Disabled");
      main.getMap().enable();
   },
   _getModels : function () {
      return (this.state.isAlbumView())? this.state.getPlaces() : this.state.getAlbums();
   },
};
