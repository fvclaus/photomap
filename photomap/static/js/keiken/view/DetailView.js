/*jslint */
/*global $, define, main, mpEvents, ALBUM_VIEW,  assert, assertTrue */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class shows description and titles of current Album/Place/Photo in several Places of the UI
 */


define([
   "dojo/_base/declare",
   "./View",
   "../model/Photo",
   "../model/Place",
   "../model/Album",
   "../presenter/DetailPresenter",
   "../util/Communicator",
   "../util/Tools"
],
   function (declare, View, Photo, Place, Album, DetailPresenter, communicator, tools) {
      return declare(View, {
         constructor : function (isSlider) {
            this.$container = $("#mp-right-column");
            
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
            
            this.presenter = new DetailPresenter(this, isSlider);
            
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
         /**
          * @description Hides the detail box. The teaser box should be visible afterwards
          */
         hideDetail : function () {
            
            this.$explanationContainer.addClass("mp-nodisplay");
            this.$teaserContainer.removeClass("mp-nodisplay");
         },
         slideIn : function () {
            var instance = this;
            this.$container.animate({left: "50%"}, 300);
         },
         slideOut : function () {
            this.$container.animate({left: "100%"}, 300);
         },
         _updateDetail : function (model) {
            var title = model.getType() + ": " + model.getTitle(),
                description = model.getDescription();// || gettext("NO_DESCRIPTION");
            // use text() instead of html() to prevent script tag injection or similiar
            if (!description) {
               this.$description.html(this.noDescription);
               this._bindInsertDescriptionListener(model);
            } else {
               this.$description.text(description);
            }
            this.$title.text(title);
         },
         /**
          * @public
          * @summary Sets the description in the PhotoDescription and Description box (only if necessary)
          */
         _updateTeaser : function (model) {
            var shortDescription,
                title = "Photo: " + model.getTitle(),
                description = model.getDescription();// || gettext("NO_DESCRIPTION");
            
            if (description) {
               shortDescription = tools.cutText(description, 250);
               this.$teaserDescription.text(shortDescription);
            } else {
               shortDescription = this.noTeaserDescription;
               description = this.noDescription;
               // this is from a trusted source and might be html
               this.$teaserDescription.html(shortDescription);
               this._bindInsertDescriptionListener(model);
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
               
               // there is a open explanation link which means the description did not fit into the teaser completely
               // update the explanation so it shows the photos description
               // this is necessary because the user might have looked at a description of a place or album
               // this would overwrite the photos description
               instance._updateDetail(instance.currentPhoto);
               instance._showDetail();
               communicator.publish("opened:PhotoDetail");
            });
            $(".mp-close-full-description").on("click", function (event) {
               communicator.publish("closed:Detail");
            });
         },
         _bindInsertDescriptionListener : function (model) {
            assertTrue(model !== undefined, "Must provide model parameter.");
            var instance = this;

            $(".mp-insert-description").off("click").on("click", function (event) {
               
               communicator.publish("clicked:DescriptionInsert", model);
            });
         }
      });
   });
