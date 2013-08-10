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
               
               this._bindModelUpdateListener();
            },
            /**
             * @description Inserts a model into the collection, and optionally saves it to the server and informs the subscribed classes about the insertion.
             * @param {Object} model Model to be inserted into the collection.
             * @param {Object} modelData the optional Data that is needed if the model is supposed to be saved to server (eg. photo-upload)
             * @param {Boolean} saveToServer Set true if model shall be saved to server.
             */
            insert : function (model, modelData, saveToServer) {
               var instance = this;
               
               if (saveToServer) {
                  model
                     .onSuccess(function (data, status, xhr) {
                        instance._trigger("success", [data, status, xhr]);
                        
                        model.updateProperties(data);
                        // assert that model has id and title now (not done in constructor anymore!); in production environment this shouldn't be a problem anymore and always return true,
                        // for development it is needed though to assure that the new IDU-Design works
                        if (model.assertValidity()) {
                           instance.models.push(model);
                           // start listening to model updates
                           model.onUpdate(function (model) {
                              instance._trigger("updated.Model", model);
                           });
                           // insert successful
                           instance._trigger("inserted.Model", model);
                        }
                     })
                     .onFailure(function (data, status, xhr) {
                        instance._trigger("failure", [data, status, xhr]);
                     })
                     .onError(function (xhr, status, error) {
                        instance._trigger("error", [xhr, status, error]);
                     })
                     .save(modelData);
               } else {
                  this.models.push(model);
               }
               
               return this;
            },
            /**
             * @description Deletes model from collection and server and informs the subscribed classes about the deletion.
             * @param {Object} model Model to be inserted from the collection.
             * @param {Boolean} saveToServer Set true if model shall be deleted in backend.
             */
            "delete" : function (model, saveToServer) {
               
               assertTrue(this.has(model.getId()), "Selected model is not part of the collection");
               var index = this.models.indexOf(model),
                  instance = this;
               
               if (saveToServer) {
                  model
                     .onSuccess(function (data, status, xhr) {
                        instance._trigger("success", [data, status, xhr]);
                        
                        instance.models.splice(index, 1);
                        instance._trigger("deleted.Model", model);
                     })
                     .onFailure(function (data, status, xhr) {
                        instance._trigger("failure", [data, status, xhr]);
                     })
                     .onError(function (xhr, status, error) {
                        instance._trigger("error", [xhr, status, error]);
                     })
                     .delete();
               } else {
                  this.models.splice(index, 1);
               }
               
               return this;
            },
            /**
             * @description Inserts a model into the collection, saves it to the server and informs the subscribed classes about the insertion.
             * @param {Object} rawModelData The data needed to create a model. It'll be sent to the server. It's expected to look like this:
             * {isPhotoUpload: false, formData: {serialized data from IDU-form} }
             */
            insertRaw : function (rawModelData) {
               
               assertString(rawModelData.title, "Each model needs a title");
               
               var instance = this;
               
               var initialModelData = {
                     title: rawModelData.title,
                     description: rawModelData.description
                  },
                  model = new this.modelConstructor(initialModelData);
               
               model
                  .onSuccess(function (data, status, xhr) {
                     instance._trigger("success", [data, status, xhr]);
                     
                     model.updateProperties(data);
                     // assert that model has id and title now (not done in constructor anymore!); in production environment this shouldn't be a problem anymore and always return true,
                     // for development it is needed though to assure that the new IDU-Design works
                     if (model.assertValidity()) {
                        instance.models.push(this.tempModel);
                        // start listening to model updates
                        model.onUpdate(function (model) {
                           instance._trigger("update", model);
                        });
                        // insert successful
                        instance._trigger("inserted.Model", model);
                     }
                  })
                  .onFailure(function (data, status, xhr) {
                     instance._trigger("failure", [data, status, xhr]);
                  })
                  .onError(function (xhr, status, error) {
                     instance._trigger("error", [xhr, status, error]);
                  })
                  .save(rawModelData);
               
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
               
               $(this).one("success.requestEvent", function (event, data, status, xhr) {
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
               
               $(this).one("failure.requestEvent", function (event, data, status, xhr) {
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
               
               $(this).one("error.requestEvent", function (event, xhr, status, error) {
                  // Simulate jQuery ajax response: data = [jqXHR, textStatus, errorThrown]
                  // handler can use same arguments as with the original jQuery.ajax.error
                  handler.call(context, xhr, status, error);
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
            _bindModelUpdateListener : function () {
               var instance = this;
               $.each(this.models, function (i, model) {
                  model.onUpdate(function (model) {
                     instance._trigger("updated.Model", model);
                  });
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
