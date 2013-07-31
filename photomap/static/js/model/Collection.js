/*jslint */
/*global $ */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Collections are ordered sets of models. They provide a set of methods to insert/update or delete models from the 
 * frontend as well as saving the changes to the backend/server. All changes to the collection or its models trigger events 
 * ("insert", "update", "delete") to inform classes that use the collection of the modification. There are also convenience methods
 * to add handler to those events: eg. onInsert, onUpdate, ...
 */

define(["dojo/_base/declare"], 
      function (declare) {
         return declare(null, {
            
            constructor: function (modelList, options) {
               
               this.defaults = {
                  orderBy: null
               };
               this.options = $.extend({}, this.defaults, options);
               
               this.modelName = options.modelName;
               this.modelList = modelList;
               this.defaultModelObject = options.defaultModelObject;
               
               this.temporaryModelData = null;
               
               if (options.orderBy) {
                  this._sort();
               }
            },
            /**
             * @description Inserts a model into the collection, saves it to the server and informs the subscribed classes about the insertion.
             * @param {Object} data The data needed to create a model. It'll be sent to the server.
             */
            insert : function (data) {
               
               this._trigger("insert");
               return this;
            },
            /**
             * @description Deletes model from collection and server and informs the subscribed classes about the deletion.
             */
            delete : function (id) {
               
               this._trigger("delete");
               return this;
            },
            /**
             * @description Modifies a model in the collection, saves the changes to the server and informs the subscribed classes.
             * @param {Integer} id Id of the model
             * @param {Object} data The updated data.
             */
            update : function (id, data) {
               
               this._trigger("update");
               return this;
            },
            /**
             * @description Retrieves a model from the collection, without deleting or modifying it.
             * @param {Integer} id Id of the model
             */
            get : function (id) {
               
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
               var context = thisReference || this;
               
               $(this).one("success.requestSuccess", function (event, data) {
                  // Simulate jQuery ajax response: data = [JSONResponseData, textStatus, jqXHR]
                  // handler can use same arguments as with the original jQuery.ajax.success
                  handler.call(context, data[0], data[1], data[2]);
               });
               
               return this;
            },
            /**
             * @description Adds handler to the "success"-event triggered when a request couldn't be processed by the server
             */
            onFailure : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).one("error.requestFailure", function (event, data) {
                  // Simulate jQuery ajax response: data = [JSONResponseData, textStatus, jqXHR]
                  // handler can use same arguments as with the original jQuery.ajax.success
                  handler.call(context, data[0], data[1], data[2]);
               });
               
               return this;
            },
            /**
             * @description Adds handler to the "error"-event triggered when there was a network error and the request couldn't be submitted
             */
            onError : function (handler, thisReference) {
               var context = thisReference || this;
               
               $(this).one("error.networkError", function (event, data) {
                  // Simulate jQuery ajax response: data = [jqXHR, textStatus, errorThrown]
                  // handler can use same arguments as with the original jQuery.ajax.error
                  handler.call(context, data[0], data[1], data[2]);
               });
               
               return this;
            },
            /**
             * @description Sorts the models by the property given in options.orderBy. If this options is undefined or null, the models won't be sorted!
             */
            _sort : function () {
               
            }
            /**
             * @description Takes response object and returns model that may be inserted into the collection!
             * @param {Object} response Ajax-response object (JSON!)
             */
            _parse : function (response) {
               
            },
            _save : function (data, url, options) {
               
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
