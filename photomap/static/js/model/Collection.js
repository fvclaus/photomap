/*jslint */
/*global $ */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Collections are ordered sets of models. They provide a set of methods to insert/update or delete models from the 
 * frontend as well as saving the changes to the backend/server (via model.save()). All changes to the collection or its models trigger events 
 * ("insert", "update", "delete") to inform classes that use the collection of the modification. There are also convenience methods
 * to add handler to those events: eg. onInsert, onUpdate, ... All events triggered on a model in the collection are triggered on the collection as well (eg. request-events such as success, error)
 */

define(["dojo/_base/declare"], 
      function (declare) {
         return declare(null, {
            
            constructor: function (modelList, options) {
               
               this.defaults = {
                  orderBy: null
               };
               this.options = $.extend({}, this.defaults, options);
               
               this.modelConstructor = options.modelConstructor;
               this.modelType = options.modelType;
               this.models = modelList;
               
               
               if (options.orderBy) {
                  this._sort();
               }
            },
            /**
             * @description Inserts a model into the collection, saves it to the server and informs the subscribed classes about the insertion.
             * @param {Object} rawModelData The data needed to create a model. It'll be sent to the server. It's expected to look like this:
             * {isPhotoUpload: false, formData: {serialized data from IDU-form} }
             */
            insert : function (rawModelData) {
               
               assertString(rawModelData.formData.title, "Each model needs a title");
               
               var initalModelData = {
                     title: rawModelData.formData.title,
                     description: rawModelData.formData.description
                  },
                  model = new this.modelConstructor(initialModelData);
               
               model
                  .onSuccess(function (data, status, xhr) {
                     this._trigger("success", [data, status, xhr]);
                     
                     model.updateProperties(data);
                     // assert that model has id and title now (not done in constructor anymore!); in production environment this shouldn't be a problem anymore and always return true,
                     // for development it is needed though to assure that the new IDU-Design works
                     if (model.assertValidity()) {
                        this.models.push(model);
                        this._trigger("insert", model);
                     }
                  })
                  .onFailure(function (data, status, xhr) {
                     this._trigger("failure", [data, status, xhr]);
                  })
                  .onError(function (xhr, status, error) {
                     this._trigger("error", [xhr, status, error]);
                  })
                  .save(rawModelData);
               
               return this;
            },
            /**
             * @description Deletes model from collection and server and informs the subscribed classes about the deletion.
             */
            "delete" : function (model) {
               
               assertTrue(this.has(model.getId()), "Selected model is not part of the collection");
               var index = this.models.indexOf(model);
               
               model
                  .onSuccess(function (data, status, xhr) {
                     this._trigger("success", [data, status, xhr]);
                     
                     this.models.splice(index, 1);
                     this._trigger("delete", model);
                  })
                  .onFailure(function (data, status, xhr) {
                     this._trigger("failure", [data, status, xhr]);
                  })
                  .onError(function (xhr, status, error) {
                     this._trigger("error", [xhr, status, error]);
                  })
                  .save(null, true);
               
               return this;
            },
            /**
             * @description Modifies a model in the collection, saves the changes to the server and informs the subscribed classes.
             * @param {Integer} id Id of the model
             * @param {Object} data The updated data.
             */
            update : function (model, newData) {
               
               assertTrue(this.has(model.getId()), "Selected model is not part of the collection");
               
               model
                  .onSuccess(function (data, status, xhr) {
                     this._trigger("success", [data, status, xhr]);
                     
                     model.updateProperties(newData);
                     this._trigger("update", model);
                  })
                  .onFailure(function (data, status, xhr) {
                     this._trigger("failure", [data, status, xhr]);
                  })
                  .onError(function (xhr, status, error) {
                     this._trigger("error", [xhr, status, error]);
                  })
                  .save(newData);
               return this;
            },
            /**
             * @param {String} name Name of the Attribute
             * @param {Object} value Value of the Attribute
             */
            getByAttribute : function (name, value) {
               return this.models.filter(function (model) {
                  return (model[name] === value);
               })[0];
            },
            /**
             * @description Retrieves a model from the collection, without deleting or modifying it. ! return undefined when model doesn't exist in collection
             * @param {Integer} id Id of the model
             */
            get : function (id) {
               return this.models.filter(function (model) {
                  return (model.getId() === id);
               })[0];
            },
            /**
             * @description Checks if the Collection contains a certain model
             * @param {Integer} id Id of the model (id is unique!)
             */
            has : function (id) {
               return (this.get(id) !== undefined);
            },
            /**
             * ---------------------------------------
             * Convenience methods for all the events 
             * triggered on the collection
             * ---------------------------------------
             */
            onInsert : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).on("insert", function (event, data) {
                  handler.call(context, data);
               });
               
               return this;
            },
            onUpdate : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).on("delete", function (event, data) {
                  handler.call(context, data);
               });
               
               return this;
            },
            onDelete : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).on("delete", function (event, data) {
                  handler.call(context, data);
               });
               
               return this;
            },
            /**
             * @description Adds handler to the "success"-event triggered after model-data is succesfully saved to the server
             */
            onSuccess : function (handler, thisReference) {
               var context = thisReference || this,
                  instance = this;
               
               $(this).one("success.requestEvent", function (event, data) {
                  // Simulate jQuery ajax response: data = [JSONResponseData, textStatus, jqXHR]
                  // handler can use same arguments as with the original jQuery.ajax.success
                  handler.call(context, data[0], data[1], data[2]);
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
               
               $(this).one("failure.requestEvent", function (event, data) {
                  // Simulate jQuery ajax response: data = [JSONResponseData, textStatus, jqXHR]
                  // handler can use same arguments as with the original jQuery.ajax.success
                  handler.call(context, data[0], data[1], data[2]);
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
               
               $(this).one("error.requestEvent", function (event, data) {
                  // Simulate jQuery ajax response: data = [jqXHR, textStatus, errorThrown]
                  // handler can use same arguments as with the original jQuery.ajax.error
                  handler.call(context, data[0], data[1], data[2]);
                  $(instance).off(".RequestEvent");
               });
               
               return this;
            },
            /**
             * @description Sorts the models by the property given in options.orderBy. If this options is undefined or null, the models won't be sorted!
             */
            _sort : function () {
               var instance = this;
               
               this.models.sort(function (model, copy) {
                  return model[instance.options.orderBy] - copy[instance.options.orderBy];
               });
            },
            /**
             * @description Wraps jQuery .trigger() - triggers event on the collection.
             * @param {String} eventName
             * @param {Object} data Data to be passed to the handler. data mayb be an Array, Object or basically anything else
             */
            _trigger : function (eventName, data) {
               $(this).trigger(eventName, data);
            }
            
         });
      });
