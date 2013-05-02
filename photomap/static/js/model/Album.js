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
             getSecret : function () {
                return this.secret;
             }
          });
       });
