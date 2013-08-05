/*jslint */
/*global $, define, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class inits the app and fetches the initial data from the server.
 */

define(["dojo/_base/declare", "main/Main", "util/Communicator", "ui/UIState"],
       function (declare, Main, communicator, state) {
          return declare(null, {


             start : function () {
                console.log("AppInitializer started");
                main = new Main();
                assertTrue(state.isAlbumView() || state.isDashboardView(), "current view has to be either albumview or dashboardview");
                
                main.init();
                //this._runInitializer(main);
                //this._runInitializer(main.getUI());
                
                // do some page specific stuff
                if (window && window.init) {
                   init();
                }
                communicator.subscribeOnce("init", this._finalizeInit, this);
                if (state.isAlbumView()) {
                   this._getPlaces();
                } else if (state.isDashboardView()) {
                   this._getAlbums();
                }
             },
             _finalizeInit : function () {
                // finalize page specific initialization if needed
                if (window && window.finalizeInit) {
                   finalizeInit();
                }
                //init test, if they are present
                if (window && window.initTest) {
                   initTest();
                }
             },      
             /**
              * @description Runs over all properties of the passed Object and calls the init-method if the property is a class that has an init-method
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
                this._getInitialData("/albums");
             },
             /**
              * @private
              */
             _getPlaces : function () {
                
                var idFromUrl = /\/(\d+)\//,
                    id = idFromUrl.exec(window.location.pathname)[1];
                
                this._getInitialData("/album/" + id + "/");
             },
             /**
              * @private
              */
             _getInitialData : function (url) {

                var processedData,
                   instance = this;
                // get the albums and their info
                $.ajax({
                   type: "GET",
                   "url" : url,
                   success :  function (data) {
                      
                      //TODO "get-all-albums" does not return a data.success or data.error
                      if ((data && data.success) || (data && !data.success)) {
                         communicator.publish("loaded:initialData", data);
                      } else {
                         alert(gettext("GET_ALBUM_ERROR") + data.error);
                      }
                   },
                   error : function () {
                      alert(gettext("NETWORK_ERROR"));
                   }

                });
             }
          });
       });