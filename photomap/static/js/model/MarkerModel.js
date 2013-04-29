/*jslint */
/*global $, define, main, google, ZOOM_LEVEL_CENTERED, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON  */

"use strict";

/*
 * @author Marc-Leon Römer, Frederik Claus
 * @class Base class for both Album and Place.
 */


define(["dojo/_base/declare"],
       function (declare) {
          
          return declare(null,  {
             constructor : function (data) {
                
                this.type = data.type;
                this.title = data.title;
                this.id = data.id;
                // reading from input elements will return '' if nothing has been entered
                this.description = (data.description === "")? null : data.description;
                this.lat = data.lat;
                this.lng = data.lng;
             },
             /**
              * @public
              * @returns {String} Name of this model
              */
             getModelType : function () {
                return this.type;
             },
             /**
              * @public
              * @returns {Integer} Id of this model
              */
             getId : function () {
                return this.id;
             },
             getTitle : function () {
                return this.title;
             },
             getDescription : function () {
                return this.description;
             },
             setTitle : function (title) {
                this.title = title;
             },
             setDescription : function (description) {
                this.description = description;
             },
             /**
              * @public
              * @returns {float} Latitude
              */
             getLat : function () {
                return this.lat;
             },
             /**
              * @public
              * @returns {float} Longitude
              */
             getLng : function () {
                return this.lng;
             }
          });
       });
