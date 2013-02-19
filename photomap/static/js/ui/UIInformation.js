/*jslint */
/*global $, main, mpEvents, ALBUM_VIEW, Photo, Place, Album */

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
   this.oldModel = null;
};

UIInformation.prototype = {

   // _setTitle : function (title) {
      
   //    if (title !== null) {
         
   //       this.$descriptionTitle.text(title);
   //       this.$fullDescriptionTitle.text(title);
   //    }
   // },
   // _setDescription : function (fullDescription) {
      
   //    var description;
   //    // the description is null (what the db says), the description is "" (what $description.val() says)
   //    if (fullDescription !== null && fullDescription !== "") {
   //       description = main.getUI().getTools().cutText(fullDescription, 350);
   //    }
   //    else{
   //       description = this.noDescription;
   //       fullDescription = this.noDescription;
   //    }
   //    this.$description.html(description);
   //    this.$fullDescription.html(fullDescription);

   //    if (description.length < fullDescription.length) {
   //       this.$description.append("<span class='mp-control mp-cursor-pointer mp-open-full-description'> [...]</span>");
   //    }

   // },
   removeDescription : function () {
      this.$descriptionTitle.empty();
      this.$description.empty();
   },
   _showDescription : function () {
      
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
      this._hideDescription(); 
   },
   _hideDescription : function () {
      
      $("#mp-full-description").addClass("mp-nodisplay");
   },
   updateAlbum : function () {
      //no album selected yet
      var album = main.getUIState().getCurrentLoadedAlbum();
      if (album  === null){
         return;
      }
      if (main.getUIState().isAlbumView()) {
         $(".mp-page-title h1").text(album.title);
      }
      this.update(album);
      // we need to show the full description after(!) the description has been updated
      // otherwise the scollpane won't initialize properly
      // this.showFullDescription();
   },

   updatePlace : function () {
      //no place loaded yet
      var place = main.getUIState().getCurrentPlace();
      if (place === null){
         return;
      }
      this.update(place);
      // // @see updateAlbum()
      // this.showFullDescription();
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
      var photo = main.getUIState().getCurrentLoadedPhoto();
      if (photo === null) {
         return;
      }
      this.update(photo);
      this.updateImageNumber();
   },
   update : function (model) {
      if (model instanceof Photo) {
         this._updatePhotoDescription(model);
         if (!(this.oldModel instanceof Photo)) {
            this._hideDescription();
         }
      } else {
         this._updateDescription(model);
         //TODO we only need to reinitialise the scrollpane, but for now:
         this._showDescription();
         // if (this.oldModel === null || this.oldModel instanceof Photo) {
         //    this._showDescription();
         // }
      }
      this.oldModel = model;
   },
   _updateDescription : function (model) {
      var title = model.getModel()+": "+model.title,
          description = model.description;
      this.$fullDescription.html(description);
      this.$fullDescriptionTitle.text(title);
   },
   /**
    * @summary Sets the description in the PhotoDescription and Description box (only if necessary)
    */
   _updatePhotoDescription : function (photo) {
      var shortDescription,
          title = "Photo: "+photo.title,
          description = photo.description;
      // the description is null (what the db says), the description is "" (what $description.val() says)
      if (description !== null && description !== "") {
         shortDescription = main.getUI().getTools().cutText(description, 350);
      }
      else{
         shortDescription = this.noDescription;
      }

      if (shortDescription.length < description.length) {
         this.$description.append("<span class='mp-control mp-cursor-pointer mp-open-full-description'> [...]</span>");
         this._updateDescription(photo);
      }
      this.$description.html(shortDescription);
      this.$descriptionTitle.text(title);
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
