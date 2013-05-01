/*jslint */
/*global $, define, main, google, ZOOM_LEVEL_CENTERED, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON  */

"use strict";

/*
 * @author Marc-Leon Römer, Frederik Claus
 * @class Base class for both Album and Place.
 */


define(["dojo/_base/declare", "model/Model"],
       function (declare, Model) {
          
          return declare(Model,  {
             constructor : function (data) {
                this.lat = data.lat;
                this.lng = data.lng;
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
