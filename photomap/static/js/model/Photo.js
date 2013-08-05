/*jslint */
/*global $, main, define */

"use strict";

/**
 * @author Frederik Claus
 * @class is stored in a place object, encapsulation of an marker
 */


define(["dojo/_base/declare", 
        "model/Model"],
       function (declare, Model) {
          
          return declare(Model ,{
             constructor : function (data) {
                
                this.type = 'Photo';
                this.photo = data.photo;
                this.thumb = data.thumb;
                this.order = data.order;
                this.visited = data.visited;
             },
             getOrder : function () {
                return this.order;
             },
             getPhoto : function () {
                return this.photo;
             },
             getThumb : function () {
                return this.thumb;
             },
             getSource : function (srcPropertyName) {
                if (!this[srcPropertyName]) {
                   throw new Error("UnknownPropertyError : " + srcPropertyName);
                }
                return this[srcPropertyName];
             },
             setVisited : function (visited) {
                this.visited = visited;
             },
             isVisited : function () {
                return this.visited;
             },
             //TODO Every model has a method .getId() (and getter for all other properties too)-> this method is sort of obsolete..
             toString : function () {
                //return this.id;
                throw new Error("DoNotUseThisError");
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
                // change method to POST and add title and description for Update or Formdata (photo-upload) for Insert
                if (!deleteMe) {
                   settings.type = "POST";
                   if (newData.isPhotoUpload) {
                      settings.processData = false;
                      settings.contentType = false;
                      settings.cache = false;
                      settings.data = this._parseFormData(newData.formData);
                   } else {
                      settings.data["title"] = newData.title;
                      settings.data["description"] = newData.description;
                   }
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
             },
             _parseFormData : function (data) {
                var formData = new FormData();
                
                formData.append('place', data.place);
                formData.append('title', data.title);
                formData.append('description', data.description);
                formData.append('photo', data.photo);
                
                return formdata;
             }
          });
       });

