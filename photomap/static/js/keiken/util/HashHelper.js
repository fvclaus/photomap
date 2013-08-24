/*jslint */
/*global $, define, gettext, parseInt, assertString */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Provides convenience methods to change or retrieve browser history state. Is restricted to hash-changes.
 * The hash schema is: #/place/id/page/id/photo/id - where page means the current gallery page
 * The ids of place and photo are consecutively set in the backend, the page id is set frontend and starts over in each place
 */

define(["dojo/_base/declare"],
      function (declare) {
         var HashHelper = declare(null, {
            
            constructor: function () {
               
               this.defaultState = {
                  album: null,
                  place: null,
                  page: null,
                  photo: null
               };
               this.validHashes  = [
                  /^#!\/(album)\/(\d+)\/$/,
                  /^#!\/(place)\/(\d+)\/$/,
                  /^#!\/(place)\/(\d+)\/(page)\/(\d+)\/$/,
                  /^#!\/(place)\/(\d+)\/(page)\/(\d+)\/(photo)\/(\d+)\/$/,
               ];
            },
            /**
             * @description Can be used to update the current history state and the current hash. Call either .update("place", 5[, options]) or .update({place: 5}[, options])
             * @param {Object} properties May be object ({place: 5, page: 8}) or string ("place") defining the properties that have to be changed
             * @param {Object} newValue Optional. Not needed when properties parameter is an object. Contains new value for the given property.
             * @param {Object} options Possible options are: 
             * - "dontUseCurrent" {Boolean} -> If set to True, HashHelper will set a new state (sets all undefined properties to null) instead of using the current state 
             * - "replace" {Boolean} -> If set to True, HashHelper will replace the current state in the history instead of pushing a new one
             * - "title" {String} -> Defaults to "". Title for the new history state. (!) Currently ignored by some browsers. (!)
             */
            update : function (properties, newValue, options) {
               var options = (typeof properties === "string") ? options : newValue,
                  method = options.replace ? "replaceState" : "pushState",
                  state = this._parseProperties(properties, newValue, options),
                  hash = this._createHash(state),
                  title = options.title || "";
                                    
               window.history[method](state, title, hash);
            },
            /**
             * 
             * @param {String} hash If undefined, parseHash will parse current window hash.
             * @return Returns Object containing information given in the hash.
             */
            parse : function (hash) {
               var url = hash || window.location.hash,
                  parsedHash = {},
                  hashParams,
                  i = 1,
                  k = 0;
                  console.log(url);
               // test if hash is valid and parse it into an array
               for (k; k < this.validHashes.length; k++) {
                  hashParams = this.validHashes[k].exec(url);
                  if (hashParams) break;
               }
               if (hashParams) {
                  // create an object containing information given in the hash
                  for (i; i < hashParams.length; i += 2) {
                     parsedHash[hashParams[i]] = hashParams[i+1];
                  }
               }
               return $.extend({}, this.defaultState, parsedHash);
            },
            getCurrentState : function () {
               return $.extend({}, this.defaultState, window.history.state);
            },
            _parseProperties : function (properties, newValue, options) {
               var newState = {},
                  options = (typeof properties === "string") ? options : newValue,
                  oldState = options.dontUseCurrent ? this.defaultState : this.getCurrentState(),
                  property;
               
               $.extend(newState, oldState);
               
               if (typeof properties === "string") {
                  property = properties;
                  properties = {};
                  properties[property] = newValue;
               }
               
               if (this._validateProperties(properties)) {
                  $.extend(newState, properties);
               }
               
               return newState;
            },
            _createHash : function (state) {
               var hash = "#!/";
               
               $.each(state, function (key, value) {
                  if (value) {
                     hash += key + "/" + value + "/";
                  }
               });
               
               return hash;
            },
            _validateProperties : function (properties) {
               var instance = this;
               $.each(properties, function (property, value) {
                  if (!instance.defaultState.hasOwnProperty(property)) {
                     throw new Error("InvalidStatePropertyError");
                  }
               });
               return true;
            }
            
         }),
         
         _instance = new HashHelper();
         return _instance;
      });
