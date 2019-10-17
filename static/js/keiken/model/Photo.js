/*jslint */
/*global $, main, define, assertTrue, FormData */

"use strict";

/**
 * @author Frederik Claus
 * @class is stored in a place object, encapsulation of an marker
 */


define(["dojo/_base/declare", 
        "./Model"],
       function (declare, Model) {
          
          return declare(Model ,{
             constructor : function (data) {
                
                this.type = 'Photo';
                this.photo = data.photo;
                this.thumb = data.thumb;
                this.order = data.order;
                this.visited = (data.visited)? true : false;
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
             toString : function () {
                return Number(this.id).toString();
             },
             save : function (newData) {
                assertTrue(typeof newData === "object" && newData !== null, "Must provide data to update.");
                var instance = this,

                   settings = {
                      url: "/" + this.type.toLowerCase() + "/",
                      type: "post",
                      data: {},
                      dataType: "json",
                      success: function (data, status, xhr) {
                         if (data.success) {
                            instance._trigger("success", [data, status, xhr]);
                            instance._setProperties(data);
                            instance._setProperties(instance._newTitleAndDescription);
                            // Server will return the new id upon insertion.
                            if (data.id === undefined) {
                               instance._trigger("updated", instance);
                            } else {
                               //set id, photo and thumb of the new Photo
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
                // newData will go out of scope and the server does not echo the POST data.
                //TODO why does newData + anything that is not instance in the var declaration go out of scope?
                // Maybe newData is being garbage collected?
                this._newTitleAndDescription = {
                       title : newData.title,
                       description : newData.description
                };
                // add id if model exists -> for Update (id does not exist before Insert -> not needed)
                if (this.id > -1) {
                   settings.url += this.id + "/";
                }
                // add title and description for Update or Formdata (photo-upload) for Insert
                if (newData.isPhotoUpload) {
                   settings.processData = false;
                   settings.contentType = false;
                   settings.cache = false;
                   settings.data = this._parseFormData(newData);
                } else {
                   settings.data = newData;
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
                
                return formData;
             }
          });
       });
