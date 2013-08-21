/*jslint */
/*global $, define, main, InfoMarker, google, window, assertTrue */

"use strict";

/*
 * Album.js
 * @author Frederik Claus
 * @class Models an album that holds places
 */


define(["dojo/_base/declare", 
        "./MarkerModel", 
        "./Place", 
        "./Collection"],
       function (declare, MarkerModel, Place, Collection) {
          console.log("Album: start");
          return declare(MarkerModel, {
             constructor : function (data) {
                
                this.type = 'Album';
                this.owner = data.isOwner || false;
                this.secret = data.secret || "";
                
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
             },
             getPlaces : function () {
                return this.places;
             }
          });
       });
