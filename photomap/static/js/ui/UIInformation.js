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
   this.$description = $(".mp-description-wrapper").find(".mp-description-body");
   this.$imageNumber = $(".mp-image-number");
   this.$descriptionTitle = $(".mp-description-title");
   this.$fullDescription = $(".mp-full-description-body");
   this.$fullDescriptionTitle = $(".mp-full-description-title");
};

UIInformation.prototype = {

   _setTitle : function (title) {
      
      if (title !== null) {
         
         main.getUIState().setCurrentTitle(title);
         this.$descriptionTitle.text(title);
         this.$fullDescriptionTitle.text(title);
      }
   },
   _setDescription : function (description) {
      
      var text;
      if (description !== null) {
         
         main.getUIState().setCurrentDescription(description);
         text = main.getUI().getTools().cutText(description, 350);

         this.$description.html(text);
         this.$fullDescription.html(description);
         if (text.length < description.length) {
            this.$description.append("<span class='mp-control mp-cursor-pointer mp-open-full-description'> [...]</span>");
         }
      }
   },
   removeDescription : function () {
      this.$descriptionTitle.empty();
      this.$description.empty();
   },
   showFullDescription : function () {
      
      var $container, $innerWrapper, description, title;
      $container = $("#mp-full-description");
      $innerWrapper = $(".mp-full-description-wrapper");
      $innerWrapper.jScrollPane();
      
      $container.removeClass("mp-nodisplay");
      $innerWrapper
         .data("jsp")
         .reinitialise();
   },
   hideFullDescription : function () {
      
      $("#mp-full-description").addClass("mp-nodisplay");
   },
   /* ---- Album ---- */
   updateAlbumTitle : function () {
      
      title = main.getUIState().getCurrentLoadedAlbum().title;
      
      this._setTitle(title);
      if (main.getUIState().getPage() === ALBUM_VIEW) {
         $(".mp-page-title h1").text(title);
      }
   },
   updateAlbumDescription : function () {
      info = main.getUIState().getCurrentLoadedAlbum().description;
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
      this._setTitle(title);
   },
   updatePlaceDescription : function () {
      info = main.getUIState().getCurrentPlace().description;
      this._setDescription(info);
   },
   updatePlace : function () {
      this.updatePlaceTitle();
      this.updatePlaceDescription();
   },
   /* ---- end Place ---- */
   
   /* ---- Photo ---- */
   updatePhotoTitle : function () {
      title = main.getUIState().getCurrentLoadedPhoto().title;
      this._setTitle(title);
   },
   updatePhotoDescription : function () {
      info = main.getUIState().getCurrentLoadedPhoto().description;
      this._setDescription(info);
   },
   updateImageNumber : function () {
      
      var photos, state;
      
      state = main.getUIState();
      photos = state.getPhotos();
      
      this.$imageNumber.text((state.getCurrentLoadedPhotoIndex() + 1) + "/" + photos.length);
   },
   emptyImageNumber : function () {
      this.$imageNumber.text("0/0");
   },
   updatePhoto : function () {
      this.updatePhotoDescription();
      this.updatePhotoTitle();
      this.updateImageNumber();
   },
   /* ---- end Photo ---- */
   
   /* ---- other stuff ---- */
   updateUsedSpace : function () {
      
      var used, total;
      used = main.getClientState().getUsedSpace();
      total = main.getClientState().getQuota();
      
      $(".mp-limit").text(used + "/" + total + " MB");
   }
};
