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
      var AppStateHelper = declare(null, {
         
         constructor: function () {
            
            this.defaultState = {
               album: null,
               selectedPlace: null,
               openedPlace: null,
               page: null,
               photo: null,
               fullscreen: false,
               description: null
            };
            this.validHashes  = [
                  /^#!\/(place)\/(\d+)\/$/,
                  /^#!\/(place)\/(\d+)\/(photo)\/(\d+)\/$/,
            ];
         },
         
         /* ---------------------------- */
         /* ------ main methods -------- */
         
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
            options = (typeof properties === "string") ? options : newValue;
            var method = options.replace ? "replaceState" : "pushState",
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
                i = 1;
            hashParams = this.validHashes[0].exec(url);
            if (!hashParams) {
               hashParams = this.validHashes[1].exec(url);
            }
            if (hashParams) {
               // create an object containing information given in the hash
               for (i; i < hashParams.length; i += 2) {
                  parsedHash[hashParams[i]] = hashParams[i + 1];
               }
            }
            return parsedHash;
         },
         getCurrentState : function () {
            return $.extend({}, this.defaultState, window.history.state);
         },
         
         /* ----------------------------------------- */
         /* --------- convenience methods  ---------- */
         
         updateFullscreen : function (open) {
            var title = open ? "fullscreen opened" : "fullscreen closed";
            this.update("fullscreen", open, {"title": title});
         },
         updateDescription : function (open) {
            var title = open ? "description updated" : "description closed",
                newState = {description: open};
            
            if (!open) {
               newState.selectedPlace = null;
               newState.album = null;
            }
            this.update(newState, {"title": title});
         },
         updatePage : function (newPage) {
            this.update("page", newPage, {"title": "navigated gallery"});
         },
         updatePhoto : function (newPhoto) {
            this.update({
               photo: newPhoto,
               description: false,
               selectedPlace: null
            }, {"title": "navigated slideshow"});
         },
         updateAlbum : function (newAlbum) {
            this.update({
               album: newAlbum,
               description: true
            }, {"title": "selected album"});
         },
         updateSelectedPlace : function (newPlace) {
            this.update({
               selectedPlace: newPlace,
               description: true
            }, {"title": "selected place"});
         },
         updateOpenedPlace : function (newPlace) {
            this.update({
               description: true,
               selectedPlace: newPlace,
               openedPlace: newPlace
            }, {
               "title": "opened place",
               dontUseCurrent: true
            });
         },
         setInitialState : function () {
            var hashState = this.parse(),
               initialState =  {
                  description: (hashState.photo === null),
                  openedPlace: hashState.place || null,
                  photo: hashState.photo || null
               };
            console.log("Initial AppState:");
            console.log(initialState);
            this.update(initialState, {replace: true, dontUseCurrent: true, title: "initial state"});
         },
         /* --------------------------------- */
         /* -------- private methods -------- */
         
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
            
            if (state.openedPlace) {
               hash += "place/" + state.openedPlace + "/";
               if (state.photo) {
                  hash += "photo/" + state.photo + "/";
               }
            }
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
          
          _instance = new AppStateHelper();
      return _instance;
   });
