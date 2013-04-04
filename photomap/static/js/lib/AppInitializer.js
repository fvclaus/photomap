/*jslint */
/*global $, Main, initialize, initializeTest, finalizeInitialization, assertTrue, gettext */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class Initializes the app and fetches the initial data from the server.
 */

var main = null,
   AppInitializer = function () {
   };

AppInitializer.prototype = {
   start : function () {

      main = new Main();
      assertTrue(main.getUIState().isAlbumView() || main.getUIState().isDashboardView(), "current view has to be either albumview or dashboardview");
      
      main.initialize();
      this._runInitializer(main);
      this._runInitializer(main.getUI());
      
      // do some page specific stuff
      if (window && window.initialize) {
         initialize();
      }
      // subscribe to processed:initialData event to continue with initialization afterwards..
      main.getCommunicator().subscribeOnce("processed:initialData", this._finalizeInitialization);
      
      if (main.getUIState().isAlbumView()) {
         this._getPlaces();
      } else if (main.getUIState().isDashboardView()) {
         this._getAlbums();
      }
   },
   _finalizeInitialization : function () {
      // finalize page specific initialization if needed
      if (window && window.finalizeInitialization) {
         finalizeInitialization();
      }
      //initialize test, if they are present
      if (window && window.initializeTest) {
         initializeTest();
      }
   },      
   /**
    * @description Runs over all properties of the passed Object and calls the initialize-method if the property is a class that has an initialize-method
    * @param {Object} classFacade A class that contains other classes as properties.
    */
   _runInitializer : function (classFacade) {
      $.each(classFacade, function (className, appClass) {
         if (appClass !== null && typeof appClass === "object" && appClass.initialize) {
            appClass.initialize();
         }
      });
   },
   /**
    * @private
    */
   _getAlbums : function () {
      this._getInitialData("/get-all-albums");
   },
   /**
    * @private
    */
   _getPlaces : function () {
      
      var idFromUrl = /-(\d+)$/,
         data = {
            "id" : idFromUrl.exec(window.location.pathname)[1]
         };
      
      this._getInitialData("/get-album", data);
   },
   /**
    * @private
    */
   _getInitialData : function (url, data) {
      var instance = this;
      // get the albums and their info
      $.ajax({
         "url" : url,
         "data": data || null,
         success :  function (data) {
            
            //TODO "get-all-albums" does not return a data.success or data.error
            if ((data && data.success) || (data && !data.success)) {
               main.getCommunicator().publish("loaded:initialData", data);
            } else {
               alert(gettext("GET_ALBUM_ERROR") + data.error);
            }
         },
         error : function () {
            alert(gettext("NETWORK_ERROR"));
         }

      });
   }
};