/*jslint */
/*global $, main, DASHBOARD_VIEW, ALBUM_VIEW, UIPhotoListener, UIPlaceListener, UIAlbumListener, UIEditControls */

"use strict";

/**
 * @author Frederik Claus
 * @class UIControls adds Listener to all input elements that are present once the site is loaded
 */

var UIControls;

UIControls = function (maxHeight) {


   this.$delete = $("img.mp-option-delete");
   this.$update = $("img.mp-option-modify");
   this.$share = $("img.mp-option-share");

   this.$logout = $(".mp-option-logout");
   this.$insert = $(".mp-option-insert-photo");


};

UIControls.prototype = {

   initWithoutAjax : function () {
      this.photoListener = new UIPhotoListener();
      this.placeListener = new UIPlaceListener();
      this.albumListener = new UIAlbumListener();
      this.editControls = new UIEditControls();

   },
   initAfterAjax : function () {
      
      var state, clientstate, page;
      state = main.getUIState();
      clientstate = main.getClientState();

      if (state.isDashboardView() || (state.isAlbumView() && clientstate.isAdmin())) {
         this.editControls.bindListener();
         this.bindListener(page);
      }
   },
   handleGalleryDragover : function (event){
      this.photoListener.handleDrag(event);
   },
   handleGalleryDrop : function (event) {
      this.photoListener.handleDrop(event);
   },

   getEditControls : function () {
      return this.editControls;
   },
   /**
    * @public
    */
   setModifyAlbum : function (active) {
      this.isModifyAlbum = active;
      this.isModifyPlace = !active;
      this.isModifyPhoto = !active;
   },
   /**
    * @public
    */
   setModifyPlace : function (active) {
      this.isModifyPlace = active;
      this.isModifyAlbum = !active;
      this.isModifyPhoto = !active;
   },
   /**
    * @public
    */
   setModifyPhoto : function (active) {
      this.isModifyPhoto = active;
      this.isModifyPlace = !active;
      this.isModifyAlbum = !active;
   },

   /* ---- Listeners ---- */
   _bindFullGalleryListener : function () {
      $(".mp-open-full-gallery").on("click", function (event) {
         
         if (!main.getUI().isDisabled() && main.getUIState().getPlaces().length !== 0) {
            main.getUI().getGallery().showFullGallery();
         }
      });
      $(".mp-close-full-left-column").on("click", function (event) {
         
         if (!main.getUI().isDisabled()) {
            main.getUI().getGallery().hideFullGallery();
         }
      });
   },
   _bindFullDescriptionListener : function () {
      $("#mp-description").on("click", ".mp-open-full-description", function (event) {
         
         if (!main.getUI().isDisabled()) {
            main.getUI().getInformation().showFullDescription();
         }
      });
      $(".mp-close-full-description").on("click", function (event) {
         
         if (!main.getUI().isDisabled()) {
            main.getUI().getInformation().hideFullDescription();
         }
      });
   },
   /**
    * @public
    * @see UIAlbum
    */
   bindInsertPhotoListener : function () {
      //TODO use method on Gallery --> Gallery.addListener(...)
      var instance = this,
         insertPhotoListener = function () {
            instance.photoListener.insert.call(instance.photoListener);
         };
         
      $("#mp-gallery").on("click.PhotoMap", ".mp-empty-tile", insertPhotoListener);
      this.$insert.on("click.PhotoMap", insertPhotoListener);
   },
   /**
    * @public
    * @see UITools
    */
   /**
    * @private
    */
   _bindInsertListener : function () {
      var map = main.getMap(), instance = this, state = main.getUI().getState();

      map.addClickListener(function (event) {
         if (!main.getUI().isDisabled()) {
            //create new place with description and select it
            if (!state.isDashboardView()) {
               instance.placeListener.insert(event);
            } else {
               instance.albumListener.insert(event);
            }
         }
      });
   },
   /**
    * @private
    */
   _bindUpdateListener : function () {
      
      var instance = this,
          state = main.getUIState();
      
      this.$update
         .on("click", function (event) {

            if (!main.getUI().isDisabled()) {
               if (instance.isModifyPhoto) {
                  instance.photoListener.update(state.getCurrentPhoto());
               } else if (instance.isModifyPlace) {
                  instance.placeListener.update(state.getCurrentPlace());
               } else if (instance.isModifyAlbum) {
                  instance.albumListener.update(state.getCurrentAlbum());
               }
            }
         });
   },

   /**
    * @private
    */
   _bindDeleteListener : function () {

      var instance = this,
          state = main.getUIState();

      this.$delete
         .on("click", function (event) {
            
            if (!main.getUI().isDisabled()) {
               if (instance.isModifyPhoto) {
                  instance.photoListener.delete(state.getCurrentPhoto());
               } else if (instance.isModifyPlace) {
                  instance.placeListener.delete(state.getCurrentPlace());
               } else if (instance.isModifyAlbum) {
                  instance.albumListener.delete(state.getCurrentAlbum());
               }
            }
         });
   },

   /**
    * @private
    */
   _bindShareListener : function () {
      
      var instance = this,
          state = main.getUIState(), 
          tools = main.getUI().getTools(), url, id;
      
      this.$share
         .on("click", function (event) {
            if (!main.getUI().isDisabled()) {
               instance.albumListener.share(state.getCurrentAlbum());
            }
         });
   },
   bindPlaceListener : function (place) {
      this.placeListener.bindListener(place);
   },
   bindAlbumListener : function (album) {
      this.albumListener.bindListener(album);
   },
   /**
    * @description Binds all the Listeners required by this page. Also handles window.load Listener
    * @param {String} page Name of current page
    */
   bindListener : function () {
      
      this._bindDeleteListener();
      this._bindUpdateListener();
      this._bindShareListener();
      this._bindInsertListener();
      this._bindFullDescriptionListener();
      if (main.getUIState().isDashboardView()) {
         this.bindAlbumListener();
      } else if (main.getUIState().isAlbumView()) {
         this._bindFullGalleryListener();
         this.bindInsertPhotoListener();
         this.bindPlaceListener();
      }
   },

};
