/*jslint */
/*global $, main, mpEvents, ALBUM_VIEW, Photo, Place, Album */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class shows description and titles of current Album/Place/Photo in several Places of the UI
 */

var UIInformation, title, info, api;

UIInformation = function () {
   this.$explanationContainer = $("#mp-detail");
   this.$teaserContainer = $("#mp-detail-teaser");

   this.$descriptionWrapper = $("#mp-detail-description-wrapper");
   this.$description = this.$descriptionWrapper.children("p");
   this.$title = $("#mp-detail-title");

   this.$teaserDescription = $("#mp-detail-teaser-description");
   this.$teaserTitle = $("#mp-detail-teaser-title");

   this.noDescription = this.$description.html();
   this.noTeaserDescription = this.$teaserDescription.html();

   this.oldModel = null;
   this.currentPhoto = null;

   this._bindListener();
   // this.$teaserDescription.html("No Description available");
   // this.$teaserTitle.html("No photo selected");
      // var $innerWrapper = this.$description.parent();
      // $innerWrapper.jScrollPane(); 
      // var $innerWrapper = this.$title.siblings("div");
   this.$descriptionWrapper.jScrollPane(); 
};

UIInformation.prototype = {

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
   update : function (model) {
      if (model instanceof Photo) {
         this.currentPhoto = model;
         this._updateTeaser(model);
         if (!(this.oldModel instanceof Photo)) {
            this._hideDetail();
         }
      } else if (model instanceof Album || model instanceof Place) {
         this._updateDetail(model);
         //TODO we only need to reinitialise the scrollpane, but for now:
         this._showDetail();
         // if (this.oldModel === null || this.oldModel instanceof Photo) {
         //    this._showDescription();
         // }
      } else {
         throw new Error("Unknown class " + typeof model);
      }
      this.oldModel = model;
   },
   empty : function (model) {
      if (model instanceof Photo) {
         this.$teaserDescription.empty();
         this.$teaserTitle.empty();
      } else if (model instanceof Album || model instanceof Place) {
         this.$description.empty();
         this.$title.empty();
      } else {
         throw new Error("Unknown class " + typeof model);
      }
   },
   _updateDetail : function (model) {
      var title = model.getModel()+": "+model.title,
          description = model.description;
      // use text() instead of html() to prevent script tag injection or similiar
      this.$description.text(description);
      this.$title.text(title);
   },
   /**
    * @summary Sets the description in the PhotoDescription and Description box (only if necessary)
    */
   _updateTeaser : function (photo) {
      var shortDescription,
          title = "Photo: "+photo.title,
          description = photo.description;
      // the description is null (what the db says), the description is "" (what $description.val() says)
      if (description !== null && description !== "") {
         shortDescription = main.getUI().getTools().cutText(description, 350);
         this.$teaserDescription.text(shortDescription);
      }
      else{
         shortDescription = this.noDescription;
         // this is from a trusted source and might be html
         this.$teaserDescription.html(shortDescription);
      }

      this.$teaserTitle.text(title);
      // description is too long just for the teaser
      if (shortDescription.length < description.length) {
         this.$teaserDescription.append("<span class='mp-control mp-cursor-pointer mp-open-full-description'> [...]</span>");
         // do not update explanation yet
         // update it only when user clicks on open explanation link
      }
   },
   _showDetail : function () {
      
      var $innerWrapper = this.$title.siblings("div");
      // $innerWrapper.jScrollPane(); 
      
      this.$explanationContainer.removeClass("mp-nodisplay");
      this.$descriptionWrapper
         .data("jsp")
         .reinitialise();
   },
   _hideDetail : function () {
      this.$explanationContainer.addClass("mp-nodisplay");
      this.$teaserContainer.removeClass("mp-nodisplay");
   },
   _bindListener : function () {
      var instance = this;

      this.$teaserContainer.on("click", ".mp-open-full-description", function (event) {
         
         if (!main.getUI().isDisabled()) {
            // there is a open explanation link which means the description did not fit into the teaser completely
            // update the explanation so it shows the photos description
            // this is necessary because the user might have looked at a description of a place or album
            // this would overwrite the photos description
            instance._updateDetail(instance.currentPhoto);
            instance._showDetail();
         }
      });
      $(".mp-close-full-description").on("click", function (event) {
         
         if (!main.getUI().isDisabled()) {
            instance._hideDetail();
         }
      });
   },
   /* ---- other stuff ---- */
   updateUsedSpace : function () {
      
      var used, total;
      used = main.getClientState().getUsedSpace();
      total = main.getClientState().getQuota();
      
      $("#mp-user-limit").text(used + "/" + total + " MB");
   }
};
