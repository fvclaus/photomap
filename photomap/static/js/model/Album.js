/*jslint */
/*global $, define, main, InfoMarker, google, window, assertTrue */

"use strict";

/*
 * Album.js
 * @author Frederik Claus
 * @class Models an album that holds places
 */


define(["dojo/_base/declare", "model/InfoMarker", ],
       function (declare, InfoMarker, detail) {
          console.log("Album: start");
          return declare(InfoMarker, {
             constructor : function (data) {
                assertTrue(data.secret, "album secret Must not be undefined");
                
                data.model = 'Album';
                this.isOwner = data.isOwner || false;
                this.secret = data.secret;
                
                this.checkIconStatus();
                this._bindListener();

             },
             /*
              * @private
              */
             _bindListener : function () {
                
                var state = main.getUIState(), 
                    instance = this;
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
