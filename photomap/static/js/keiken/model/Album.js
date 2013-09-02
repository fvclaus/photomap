/*jslint */
/*global $, define, main, InfoMarker, google, window, assertTrue */

"use strict";

/**
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
            this.owner = (typeof data.isOwner === "boolean")? data.isOwner : false;
            this.secret = data.secret || "";
            
            var places = [],
               rawPlacesData = data.places || [];
            $.each(rawPlacesData, function (index, placeData) {
               places.push(new Place(placeData));
            });
            this.places = new Collection(places, {
               modelType: "Place",
               modelConstructor: Place
            });
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
