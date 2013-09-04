/*jslint */
/*global $, define, main, google, ZOOM_LEVEL_CENTERED, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON  */

"use strict";

/**
 * @author Marc-Leon Römer, Frederik Claus
 * @class Base class for both Album and Place.
 */


define(["dojo/_base/declare", 
        "./Model"],
       function (declare, Model) {
          
          return declare(Model,  {
             constructor : function (data) {
                this.lat = data.lat;
                this.lng = data.lng || data.lon;
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
             },
             save : function (newData) {
                var instance = this,
                   settings = {
                      url: "/" + this.type.toLowerCase() + "/",
                      type: "post",
                      data: newData,
                      dataType: "json",
                      success: function (data, status, xhr) {
                         if (data.success) {
                            instance._trigger("success", [data, status, xhr]);
                            if (instance.id > -1) {
                               instance._setProperties(newData);
                               instance._trigger("updated", instance);
                            } else {
                               //set id of the new model
                               instance._setProperties(data);
                               instance._trigger("inserted", instance);
                            }
                         } else {
                            instance._trigger("failure", [data, status, xhr]);
                         }
                      },
                      error: function (xhr, status, error) {
                         instance._trigger("error", [xhr, status, error]);
                      }
                   };
                // add id if model exists -> for Update (id does not exist before Insert -> not needed)
                if (this.id > -1) {
                   settings.url += this.id + "/";
                }
                
                $.ajax(settings);
                
                return this;
             }
          });
       });
