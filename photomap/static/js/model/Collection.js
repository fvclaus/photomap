/*jslint */
/*global $, asserTrue, assertString */

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
               
               this._bindModelListener(this.models);
            },
            /**
             * @description Inserts a model into the collection and informs the subscribed classes about the insertion.
             * @param {Object} model Model to be inserted into the collection.
             */
            insert : function (model) {
               
               this.models.push(model);
               this._bindModelListener([model]);
               
               this._trigger("inserted.Model", model);
               
               return this;
            },
            /**
             * @description Deletes model from collection and server and informs the subscribed classes about the deletion.
             * @param {Object} model Model to be inserted from the collection.
             */
            "delete" : function (model) {
               
               assertTrue(this.has(model.getId()), "Selected model is not part of the collection");
               
               this.models.splice(this.models.indexOf(model), 1);
               
               this._trigger("deleted.Model", model);
               
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
            getAll : function () {
               return this.models;
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
            /**
             * @description Removes a set of given events selected by eventName and eventType
             * @param {String} name Eventname - does not remove any events if eventname wasnt specified upon created of listener (eg. onUpdate(handler, this, EVENTNAME))
             * @param {String} events May be a single event or multiple events separated by spaces - allowed Events are "deleted", "inserted", "updated"
             */
            removeEvents : function (name, events) {
               assertString(name, "Eventname has to be a string");
               
               var instance = this;
               
               if (events) {
                  if (/\s+/.test(events)) {
                     events = events.split(/\s+/);
                  } else {
                     events = [events];
                  }
               } else {
                  var events = ["inserted", "updated", "deleted"];
               }
               
               $.each(events, function (i, event) {
                  assertTrue(event === "inserted" || event === "updated" || event === "deleted", "Only following events are allowed: inserted, updated, deleted");
                  $(instance).off(event + "." + name);
               });
            },
            onInsert : function (handler, thisReference, eventName) {
               var context = thisReference || this;
               
               if (!eventName) {
                  var eventName = "Model";
               }
               
               $(this).on("inserted." + eventName, function (event, model) {
                  handler.call(context, model);
               });
               
               return this;
            },
            onUpdate : function (handler, thisReference, eventName) {
               var context = thisReference || this;
               
               if (!eventName) {
                  var eventName = "Model";
               }
               
               $(this).on("updated." + eventName, function (event, model) {
                  handler.call(context, model);
               });
               
               return this;
            },
            onDelete : function (handler, thisReference, eventName) {
               var context = thisReference || this;
               
               if (!eventName) {
                  var eventName = "Model";
               }
               
               $(this).on("deleted." + eventName, function (event, model) {
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
             * @description Convenience method to insert a model into the collection using raw form-data, 
             * also saves it to the server and informs the subscribed classes about the insertion.
             * @param {Object} rawModelData The data needed to create a model. It'll be sent to the server.
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
                     
                     // assert that model has id and title now (not done in constructor anymore!); in production environment this shouldn't be a problem anymore and always return true,
                     // for development it is needed though to assure that the new IDU-Design works
                     if (model.assertValidity()) {
                        instance.insert(model);
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
             * @description Sorts the models by the property given in options.orderBy. If this options is undefined or null, the models won't be sorted!
             */
            _sort : function () {
               var instance = this;
               
               this.models.sort(function (model, copy) {
                  return model[instance.options.orderBy] - copy[instance.options.orderBy];
               });
            },
            _bindModelListener : function (models) {
               var instance = this;
               $.each(models, function (i, model) {
                  model
                     .onUpdate(function (model) {
                        instance._trigger("updated.Model", model);
                     })
                     .onDelete(function (model) {
                        instance.delete(model);
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
