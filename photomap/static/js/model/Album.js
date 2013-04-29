/*jslint */
/*global $, define, main, InfoMarker, google, window, assertTrue */

"use strict";

/*
 * Album.js
 * @author Frederik Claus
 * @class Models an album that holds places
 */


define(["dojo/_base/declare", "model/MarkerModel", "ui/UIState"],
       function (declare, MarkerModel, state, detail) {
          console.log("Album: start");
          return declare(MarkerModel, {
             constructor : function (data) {
                assertTrue(data.secret, "album secret Must not be undefined");
                
                this.type = 'Album';
                this.isOwner = data.isOwner || false;
                this.secret = data.secret;
                
                //this.checkIconStatus();
                //this._bindListener();

             },
             /**
              * @public
              * @returns {String} Name of this model
              */
             getModelType : function () {
                return this.type;
             },
             getSecret : function () {
                return this.secret;
             },
             /**
              * @public
              * @returns {Number} Id of this model
              */
             getId : function () {
                return this.id;
             },
             /*
              * @private
              */
             _bindListener : function () {
                
                var instance = this;
                /*
                 * @description Redirects on albumview of selected album.
                 */
                this.addListener("click", function () {
                   
                   if (!main.getUI().isDisabled()) {
                      state.setCurrentAlbum(instance);
                      state.setCurrentLoadedAlbum(instance);
                      require(["view/DetailView"], function (detail) {
                         detail.update(instance);
                      });
                   }
                });
                this.addListener("dblclick", function () {
                   //TODO this is problematique. it gets fired when a new album is added
                   //but the ui is still disabled at that moment
                   if (!main.getUI().isDisabled()) {
                      instance.openURL();
                   }
                });
             },
             openURL : function () {
                window.location.href = '/album/view/' + this.secret + '-' + this.id;
             },
             checkIconStatus : function () {
                this.showVisitedIcon();
             }
          });
       });
