/*jslint */
/*global $, main, mpEvents, ALBUM_VIEW */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class shows description and titles of current Album/Place/Photo in several Places of the UI
 */

var UIInformation, title, info, api;

UIInformation = function () {

   this.$wrapper = $("#mp-description");
   this.$album = $("#mp-album");
   this.$infoButton = $(".mp-option-information");
   this.$description = $(".mp-description-wrapper").jScrollPane();
   this.$imageNumber = this.$wrapper.find(".mp-image-number");
   this.$descriptionTitle = $(".mp-description-title span");
};

UIInformation.prototype = {

   initWithoutAjax : function () {
      this.bindListener();
      this.resizeTitleBarFont();
   },
   _setDescription : function (description) {
      api = this.$description.data('jsp');
      api.getContentPane()
         .find("p")
         .empty()
         .html(description);
      api.reinitialise();
   },
   /* ---- Album ---- */
   updateAlbumTitle : function () {
      
      title = main.getUIState().getCurrentAlbum().title;
      
      this.$descriptionTitle.text(title);
      if (main.getUIState().getPage() === ALBUM_VIEW) {
         $(".mp-page-title h1").text(title);
      }
   },
   updateAlbumDescription : function () {
      info = main.getUIState().getCurrentAlbum().description;
      this._setDescription(info);
   },
   updateAlbum : function () {
      this.updateAlbumTitle();
      this.updateAlbumDescription();
   },
   /* ---- end Album ---- */
   
   /* ---- Place ---- */
   updatePlaceTitle : function () {
      title = main.getUIState().getCurrentPlace().title;
      this.$descriptionTitle.text(title);
      $(".mp-place-title").text(title);
   },
   updatePlaceDescription : function () {
      info = main.getUIState().getCurrentLoadedPlace().description;
      this._setDescription(info);
   },
   updatePlace : function () {
      var place = main.getUIState().getCurrentLoadedPlace();
      this.updatePlaceTitle(place.title);
      this.updatePlaceDescription(place.description);
   },
   /* ---- end Place ---- */
   
   /* ---- Photo ---- */
   updatePhotoTitle : function () {
      title = main.getUIState().getCurrentPhoto().title;
      this.$descriptionTitle.text(title);
      $(".mp-photo-title").text(title);
   },
   updatePhotoDescription : function () {
      info = main.getUIState().getCurrentPhoto().description;
      this._setDescription(info);
   },
   updateImageNumber : function () {
      
      var photos, state;
      
      state = main.getUIState();
      photos = state.getPhotos();
      
      this.$imageNumber.text(" Bild " + state.getCurrentPhotoIndex() + 1 + "/" + photos.length);
   },
   hideImageNumber : function () {
      this.$imageNumber.hide();
      this.$imageNumber.next().css("margin-left", 0);
   },
   showImageNumber : function () {
      
      var margin = -this.$imageNumber.width();
      
      this.$imageNumber.show();
      this.$imageNumber.next().css("margin-left", margin);
   },
   updatePhoto : function () {
      this.updatePhotoDescription();
      this.updatePhotoTitle();
      this.updateImageNumber();
   },
   /* ---- end Photo ---- */
   
   /* ---- Fonts ---- */
   resizeTitleBarFont : function () {
      
      var $titlebar, text, width, height, tools, size;
      
      $titlebar = $(".mp-title-bar");
      text = "No title";
      width = 5000;
      height = $titlebar.height();
      tools = main.getUI().getTools();
      size = tools.calculateFontSize(text, width, height);
      $titlebar.css("fontSize", size + "px");
   },
   /* ---- end Fonts ---- */
   
   /* ---- Listener ---- */
   bindListener : function () {
      var $button, instance = this;
      this.$infoButton.unbind('click').bind('click', function () {
         $button = $(this);
         if ($button.hasClass("mp-page-title")) {
            this.updateAlbum();
         } else if ($button.hasClass("mp-place-title")) {
            this.updatePlace();
         } else if ($button.parent().hasClass("mp-photo-title")) {
            this.updatePhoto();
         }
      });
   }
};
