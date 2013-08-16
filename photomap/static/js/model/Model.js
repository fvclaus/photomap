/*jslint */
/*global $, define, main, assertNumber */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Base class for all models
 */

define(["dojo/_base/declare"],
       function (declare) {
          
          return declare(null,  {
             constructor : function (data) {
                
                this.type = data.type;
                this.title = data.title;
                if (typeof data.id === "number") {
                   this.id = data.id;
                } else {
                   this.id = -1;
                }
                // reading from input elements will return '' if nothing has been entered
                this.description = (data.description === "")? null : data.description;
             },
             /**
              * @description sets any attribute of the model to the 
              */
             set : function (name, value) {
               if (name === "id" || name === "type") {
                  throw new Error("RequestNotAllowedError");
               }
               if (this.hasOwnProperty(name)) {
                  this[name] = value;
               } else {
                  throw new Error("UnknownAttributeError");
               }
             },
             getTitle : function () {
                return this.title;
             },
             setTitle : function (title) {
                this.title = title;
             },
             getDescription : function () {
                return this.description;
             },
             setDescription : function (description) {
                this.description = description;
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
              * @returns {Number} Id of this model
              */
             getId : function () {
                return this.id;
             },
             equals : function (other) {
                //TODO how does the instanceof check work with Dojo?
                if (other instanceof this.constructor) {
                   return other.id === this.id;
                } else {
                   return false;
                }
             },
             /**
              * @description Check if the model has a title and an id, which every model has to have!
              */
             assertValidity : function () {
                assertNumber(this.id, "Every model has to have an id");
                assertString(this.title, "Every model has to have a title");
                
                return true;
             },
             "delete": function () {
                var instance = this;
                $.ajax({
                   url: "/" + this.type.toLowerCase() + "/" + this.id + "/",
                   type: "DELETE",
                   dataType: "json",
                   success: function (data, status, xhr) {
                      if (data.success) {
                         instance._trigger("success", [data, status, xhr]);
                         instance._trigger("deleted.Model", this);
                      } else {
                        instance._trigger("failure", [data, status, xhr]);
                      }
                   },
                   error: function (xhr, status, error) {
                      instance._trigger("error", [xhr, status, error]);
                   }
                });
             },
            onInsert : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).on("inserted.Model", function (event, model) {
                  handler.call(context, model);
               });
               
               return this;
            },
            onUpdate : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).on("updated.Model", function (event, model) {
                  handler.call(context, model);
               });
               
               return this;
            },
            onDelete : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).on("deleted.Model", function (event, model) {
                  handler.call(context, model);
               });
               
               return this;
            },
            /**
             * @description Adds handler to the "success"-event triggered after model-data is succesfully saved to the server
             */
            onSuccess : function (handler, thisReference) {
               var context = thisReference || this,
                  instance = this;
               
               $(this).one("success.RequestEvent", function (event, data, status, xhr) {
                  console.log(data);
                  // Simulate jQuery ajax response: data = [JSONResponseData, textStatus, jqXHR]
                  // handler can use same arguments as with the original jQuery.ajax.success
                  handler.call(context, data, status, xhr);
                  // remove other request-events (like failure, error)
                  $(instance).off(".RequestEvent");
               });
               
               return this;
            },
            /**
             * @description Adds handler to the "success"-event triggered when a request couldn't be processed by the server
             */
            onFailure : function (handler, thisReference) {
               var context = thisReference || this,
                  instance = this;
               
               $(this).one("failure.RequestEvent", function (event, data, status, xhr) {
                  // Simulate jQuery ajax response: data = [JSONResponseData, textStatus, jqXHR]
                  // handler can use same arguments as with the original jQuery.ajax.success
                  handler.call(context, data, status, xhr);
                  $(instance).off(".RequestEvent");
               });
               
               return this;
            },
            /**
             * @description Adds handler to the "error"-event triggered when there was a network error and the request couldn't be submitted
             */
            onError : function (handler, thisReference) {
               var context = thisReference || this,
                  instance = this;
               
               $(this).one("error.RequestEvent", function (event, xhr, status, error) {
                  // Simulate jQuery ajax response: data = [jqXHR, textStatus, errorThrown]
                  // handler can use same arguments as with the original jQuery.ajax.error
                  handler.call(context, xhr, status, error);
                  $(instance).off(".RequestEvent");
               });
               
               return this;
            },
            /**
             * @description Wraps jQuery .trigger() - triggers event on the collection.
             * @param {String} eventName
             * @param {Object} data Data to be passed to the handler. data mayb be an Array, Object or basically anything else
             */
            _trigger : function (eventName, data) {
               $(this).trigger(eventName, data);
            },
            _setProperties : function (data) {
               var instance = this;
               $.each(data, function (key, value) {
                  if (instance.hasOwnProperty(key)) {
                     instance[key] = value;
                  }
               });
            }
          });
       });

