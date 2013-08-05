/*jslint */
/*global $, define, main, InfoMarker, google, window, assertTrue */

"use strict";

/*
 * Album.js
 * @author Frederik Claus
 * @class Models an album that holds places
 */


define(["dojo/_base/declare", "model/MarkerModel", "model/Place", "model/Collection", "ui/UIState"],
       function (declare, MarkerModel, Place, Collection, state, detail) {
          console.log("Album: start");
          return declare(MarkerModel, {
             constructor : function (data) {
                assertTrue(data.secret, "album secret Must not be undefined");
                
                this.type = 'Album';
                this.owner = data.isOwner || false;
                this.secret = data.secret;
                
                this.places = null;
                if (data.places) {
                   var places = [];
                   $.each(data.places, function (index, placeData) {
                      places.push(new Place(placeData));
                   });
                   this.places = new Collection(places, {
                      modelType: "Place",
                      modelConstructor: Place
                   });
                }
             },
             isOwner : function () {
                return this.owner;
             },
             getSecret : function () {
                return this.secret;
             }
          });
       });
