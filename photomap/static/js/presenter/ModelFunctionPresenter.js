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

                this.currentContext = null;
                this.photoListener = new PhotoPresenter();
                this.placeListener = new PlacePresenter();
                this.albumListener = new AlbumPresenter();

             },
             setCurrentContext : function (context) {
                this.currentContext = context;
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
                  
                if (!main.getUI().isDisabled()) {
                  this.currentContext.presenter.update(event);
                }
             },

             /**
              * @public
              */
             delete : function (event) {
     
                if (!main.getUI().isDisabled()) {
                   this.currentContext.presenter.delete(event);
                }
             },

             /**
              * @private
              */
             share : function (event) {

                if (!main.getUI().isDisabled()) {
                   this.currentContext.presenter.share();
                }
             }
          });
       });
