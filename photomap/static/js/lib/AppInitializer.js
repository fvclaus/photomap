/*jslint */
/*global $, Main, init, initTest, finalizeInit, assertTrue, gettext */

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
      
      main.init();
      this._runInitializer(main);
      this._runInitializer(main.getUI());
      
      // do some page specific stuff
      if (window && window.initialize) {
         init();
      }
      // subscribe to processed:initialData event to continue with initialization afterwards..
      main.getCommunicator().subscribeOnce("processed:initialData", this._finalizeInit);
      
      if (main.getUIState().isAlbumView()) {
         this._getPlaces();
      } else if (main.getUIState().isDashboardView()) {
         this._getAlbums();
      }
   },
   _finalizeInit : function () {
      // finalize page specific initialization if needed
      if (window && window.finalizeInit) {
         finalizeInit();
      }
      //initialize test, if they are present
      if (window && window.initTest) {
         initTest();
      }
   },      
   /**
    * @description Runs over all properties of the passed Object and calls the initialize-method if the property is a class that has an initialize-method
    * @param {Object} classFacade A class that contains other classes as properties.
    */
   _runInitializer : function (classFacade) {
      $.each(classFacade, function (key, getter) {
         // test whether the key is a getter, else ignore
         if (/^get/.test(key) && !/Inherited$/.test(key)) {
            // test whether the class returned has a init method
            var appClass = getter.call(classFacade);
            if (appClass && appClass.init) {
               appClass.init.call(appClass);
            }
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