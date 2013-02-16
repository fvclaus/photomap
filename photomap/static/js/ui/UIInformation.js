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
   this.noDescription = $("#mp-description-no-description").html();
};

UIInformation.prototype = {

   _setTitle : function (title) {
      
      if (title !== null) {
         
         this.$descriptionTitle.text(title);
         this.$fullDescriptionTitle.text(title);
      }
   },
   _setDescription : function (fullDescription) {
      
      var description;
      // the description is null (what the db says), the description is "" (what $description.val() says)
      if (fullDescription !== null && fullDescription !== "") {
         description = main.getUI().getTools().cutText(fullDescription, 350);
      }
      else{
         description = this.noDescription;
         fullDescription = this.noDescription;
      }
      this.$description.html(description);
      this.$fullDescription.html(fullDescription);

      if (description.length < fullDescription.length) {
         this.$description.append("<span class='mp-control mp-cursor-pointer mp-open-full-description'> [...]</span>");
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
      if (main.getUIState().isAlbumView()) {
         $(".mp-page-title h1").text(title);
      }
   },
   updateAlbumDescription : function () {
      info = main.getUIState().getCurrentLoadedAlbum().description;
      this._setDescription(info);
   },
   updateAlbum : function () {
      //no album selected yet
      if (main.getUIState().getCurrentLoadedAlbum() === null){
         return;
      }
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
      //no place loaded yet
      if (main.getUIState().getCurrentLoadedPlace() === null){
         return;
      }
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
      //TODO I think Photo is fine in every language
      this.$imageNumber.text("Photo "+(state.getCurrentLoadedPhotoIndex() + 1) + "/" + photos.length);
   },
   emptyImageNumber : function () {
      //TODO 0/0 is a little misguiding. I suggest nothing instead.
      // this.$imageNumber.text("0/0");
      this.$imageNumber.text("");
   },
   updatePhoto : function () {
      //no photo loaded yet
      if (main.getUIState().getCurrentLoadedPhoto() === null) {
         return;
      }
      this.updatePhotoDescription();
      this.updatePhotoTitle();
      this.updateImageNumber();
   },
   /* --- fullscreen photo --- */
   
   updateFullscreen : function () {
      
      var photo = main.getUIState().getCurrentLoadedPhoto();
      $("#mp-fullscreen-title").text(photo.title);
      //$("#mp-fullscreen-image-description").text(photo.description);
   },
   
   /* ---- end Photo ---- */
   
   /* ---- other stuff ---- */
   updateUsedSpace : function () {
      
      var used, total;
      used = main.getClientState().getUsedSpace();
      total = main.getClientState().getQuota();
      
      $("#mp-user-limit").text(used + "/" + total + " MB");
   }
};
