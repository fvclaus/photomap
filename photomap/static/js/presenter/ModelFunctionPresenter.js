/*jslint */
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

/**
 * @author Frederik Claus
 * @class UIControls adds Listener to all input elements that are present once the site is loaded
 */


define(["dojo/_base/declare", "presenter/PhotoPresenter", "presenter/PlacePresenter", "presenter/AlbumPresenter"],
       function (declare, PhotoPresenter, PlacePresenter, AlbumPresenter) {
          return declare(null, {
             constructor : function (maxHeight) {
                // this has to go
                this.$logout = $(".mp-option-logout");


                this.photoListener = new PhotoPresenter();
                this.placeListener = new PlacePresenter();
                this.albumListener = new AlbumPresenter();

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

             /**
              * @public
              */
             update : function (event) {
                
                var instance = this,
                    state = main.getUIState();
                
                if (!main.getUI().isDisabled()) {
                   if (instance.isModifyPhoto) {
                      instance.photoListener.update(state.getCurrentPhoto());
                   } else if (instance.isModifyPlace) {
                      instance.placeListener.update(state.getCurrentPlace());
                   } else if (instance.isModifyAlbum) {
                      instance.albumListener.update(state.getCurrentAlbum());
                   }
                }
             },

             /**
              * @public
              */
             delete : function (event) {

                var instance = this,
                    state = main.getUIState();
                
                if (!main.getUI().isDisabled()) {
                   if (instance.isModifyPhoto) {
                      instance.photoListener.delete(state.getCurrentPhoto());
                   } else if (instance.isModifyPlace) {
                      instance.placeListener.delete(state.getCurrentPlace());
                   } else if (instance.isModifyAlbum) {
                      instance.albumListener.delete(state.getCurrentAlbum());
                   }
                }
             },

             /**
              * @private
              */
             share : function (event) {
                
                var instance = this,
                    state = main.getUIState(), 
                    tools = main.getUI().getTools(), url, id;
                

                if (!main.getUI().isDisabled()) {
                   instance.albumListener.share(state.getCurrentAlbum());
                }
             }
          });
       });
