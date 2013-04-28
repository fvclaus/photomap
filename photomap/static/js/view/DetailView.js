/*jslint */
/*global $, define, main, mpEvents, ALBUM_VIEW,  assert, assertTrue */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class shows description and titles of current Album/Place/Photo in several Places of the UI
 */


define([
   "dojo/_base/declare",
   "model/Photo",
   "model/Place",
   "model/Album",
   "presenter/DetailPresenter",
   "util/Communicator",
   "util/Tools",
   "ui/UIState"
   ],
    function (declare, Photo, Place, Album, DetailPresenter, communicator, tools, state) {
       return declare(null, {
          constructor : function () {
             this.$pageTitle = $("#mp-page-title h1");
             this.$explanationContainer = $("#mp-detail");
             this.$teaserContainer = $("#mp-detail-teaser");

             this.$descriptionWrapper = $("#mp-detail-description-wrapper");
             this.$description = this.$descriptionWrapper.children("p");
             this.$title = $("#mp-detail-title");

             this.$teaserDescriptionWrapper = $("#mp-detail-teaser-description-wrapper");
             this.$teaserDescription = this.$teaserDescriptionWrapper.children("p");
             this.$teaserTitle = $("#mp-detail-teaser-title");

             this.noDescription = this.$description.html();
             this.noTeaserDescription = this.$teaserDescription.html();

             this.currentPhoto = null;
             this.currentPlaceOrAlbum = null;
             this._bindListener();
             
             this.presenter = new DetailPresenter(this);
            
          },
          getPresenter : function () {
             return this.presenter;
          },
          /**
           * @public
           * @description This will show the details or the teaser for the details of the model in question.
           * If the model is a Place or Album, the description & title will always be displayed in the detail box.
           * If the model is a Photo, the description & title will always be displayed in the teaser box
           * @param {Photo, Place, Album} model
           */
          update : function (model) {
             assertTrue(model instanceof Photo || model instanceof Place || model instanceof Album, "input parameter model has to be instance of Photo or Place or Album");
             
             console.log(model);
             if (model instanceof Photo) {
                console.log("updating teaser");
                this.currentPhoto = model;
                this._updateTeaser(model);
                this.hideDetail();
             } else if (model instanceof Album || model instanceof Place) {
                this.currentPlaceOrAlbum = model;
                this._updateDetail(model);
                this._showDetail();
             }
          },
          /**
           * @public
           * @description Empties the teaser box if the input is the photo that is currently displayed in the teaser box.
           * If the input is the current displayed place or album, the detail box is emptied.
           * @param {Photo, Place, Album} model
           */
          empty : function (model) {
             assertTrue(model instanceof Photo || model instanceof Place || model instanceof Album, "input parameter model has to be instance of Photo or Place or Album");
             
             if (model instanceof Photo && model === this.currentPhoto) {
                this.$teaserDescription.empty();
                this.$teaserTitle.empty();
             } else if ((model instanceof Album || model instanceof Place) && model === this.currentPlaceOrAlbum) {
                this.$description.empty();
                this.$title.empty();
             }
          },
          init : function () {
             
             if (state.isAlbumView()) {
                this.updatePageTitle();
                this.update(state.getCurrentLoadedAlbum());
                this.bindPageTitleListener();
             }
          },
          updatePageTitle : function () {
             assertTrue(state.isAlbumView(), "page-title is just supposed to be changed in albumview");
             
             console.log(state.getCurrentLoadedAlbum().title);
             this.$pageTitle.text(state.getCurrentLoadedAlbum().title);
          },
          /**
           * @description Hides the detail box. The teaser box should be visible afterwards
           */
          hideDetail : function () {
             this.$explanationContainer.addClass("mp-nodisplay");
             this.$teaserContainer.removeClass("mp-nodisplay");
          },
          updateUsedSpace : function (data) {
             
             $("#mp-user-limit").text(data.used + "/" + data.total + " MB");
          },
          _updateDetail : function (model) {
             var title = model.getModelType() + ": " + model.title,
                 description = model.description || gettext("NO_DESCRIPTION");
             // use text() instead of html() to prevent script tag injection or similiar
             if (description === null) {
                this.$description.html(this.noDescription);
             } else {
                this.$description.text(description);
             }
             this.$title.text(title);
          },
          /**
           * @public
           * @summary Sets the description in the PhotoDescription and Description box (only if necessary)
           */
          _updateTeaser : function (photo) {
             var shortDescription,
                 title = "Photo: " + photo.title,
                 description = photo.description || gettext("NO_DESCRIPTION");

             if (description !== null) {
                shortDescription = tools.cutText(description, 250);
                this.$teaserDescription.text(shortDescription);
             } else {
                shortDescription = this.noTeaserDescription;
                description = this.noDescription;
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
          /**
           * @private
           * @description Shows the detail box
           */
          _showDetail : function () {
             // assertTrue(this.$descriptionWrapper.data("jsp") !== undefined, "jScrollPane has to be initialized");
             //TODO this does not work right now
             this.$explanationContainer.removeClass("mp-nodisplay");
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
                   instance.hideDetail();
                }
             });
          },
          bindPageTitleListener : function () {
             assertTrue(state.isAlbumView(), "besides in albumview, page-title isn't supposed to have a listener");
             
             var instance = this;
             
             this.$pageTitle.on('click', function () {

                if (!main.getUI().isDisabled()) {
                   instance.update(state.getCurrentLoadedAlbum());
                }
             });
          }
       });
   });
