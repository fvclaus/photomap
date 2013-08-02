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
             },
             save : function (newData, deleteMe) {
                var settings = {
                   url: "/" + this.type.toLowerCase() + "/",
                   type: "DELETE",
                   data: {},
                   dataType: "json"
                };
                // add id if exists -> for Delete or Update (id does not exist before Insert -> not needed)
                if (this.id) {
                   settings.url += this.id + "/";
                }
                // change method to POST and add title and description -> for Insert or Update (for DELETE you just need the id)
                if (!deleteMe) {
                   settings.type = "POST";
                   settings.data["title"] = newData.title;
                   settings.data["description"] = newData.description;
                }
                
                settings.success = function (data, status, xhr) {
                   if (data.success) {
                      $(this).trigger("success", [data, status, xhr]);
                   } else {
                      $(this).trigger("failure", [data, status, xhr]);
                   }
                };
                settings.error = function (xhr, status, error) {
                   $(this).trigger("error", [xhr, status, error]);
                }
                
                $.ajax(settings);
                
                return this;
             }
          });
       });
