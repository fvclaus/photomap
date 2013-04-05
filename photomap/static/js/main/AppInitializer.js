/*jslint */
/*global $, define, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class inits the app and fetches the initial data from the server.
 */


define(["dojo/_base/declare", "main/Main", "model/Place", "model/Album"],
       function (declare, Main, Place, Album) {
          return declare(null, {


             start : function () {

                main = new Main();
                assertTrue(main.getUIState().isAlbumView() || main.getUIState().isDashboardView(), "current view has to be either albumview or dashboardview");
                
                main.init();
                this._runInitializer(main);
                this._runInitializer(main.getUI());
                
                // do some page specific stuff
                if (window && window.init) {
                   init();
                }
                main.getCommunicator().subscribeOnce("init", this._finalizeInit, this);
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
                this._getInitialData("/get-all-albums", "dashboard");
             },
             /**
              * @private
              */
             _getPlaces : function () {
                
                var idFromUrl = /-(\d+)$/,
                    data = {
                       "id" : idFromUrl.exec(window.location.pathname)[1]
                    };
                
                this._getInitialData("/get-album", "album", data);
             },
             /**
              * @private
              */
             _getInitialData : function (url, view, data) {
                assertTrue(view === "dashboard" || view=== "album", "view has to be either dashboard or album");

                var processedData,
                   instance = this;
                // get the albums and their info
                $.ajax({
                   "url" : url,
                   "data": data || null,
                   success :  function (data) {
                      
                      //TODO "get-all-albums" does not return a data.success or data.error
                      if ((data && data.success) || (data && !data.success)) {
                      /*
                         if (view === "album") {
                            processedData = instance._createPlacesOrAlbums(data.places, view);
                         } else if (view === "dashboard") {
                            processedData = instance._createPlacesOrAlbums(data, view);
                         }
                         instance._finalizeInit();
                         */
                         main.getCommunicator().publish("loaded:initialData", data);
                      } else {
                         alert(gettext("GET_ALBUM_ERROR") + data.error);
                      }
                   },
                   error : function () {
                      alert(gettext("NETWORK_ERROR"));
                   }

                });
             },
             /**
              * @private
              */
             _createPlacesOrAlbums : function (data, view) {
                assertTrue(view === "dashboard" || view=== "album", "view has to be either dashboard or album");
                
                var placeOrAlbum,
                   placesOrAlbums = [],
                   instance = this;
                
                $.each(data, function (index, placeOrAlbumData) {
                  if (view === "dashboard") {
                     placeOrAlbum = new Album(placeOrAlbumData);
                     main.getUIState().insertAlbum(placeOrAlbum);
                  } else if (view === "album") {
                     placeOrAlbum = new Place(placeOrAlbumData);
                     main.getUIState().insertPlace(placeOrAlbum);
                  }

                  placesOrAlbums.push(placeOrAlbum);
                   
                });
                
                if (view === "album") {
                   placesOrAlbums = this._sortPhotos(placesOrAlbums);
                }
                return placesOrAlbums;
             },
             /**
              * @private
              */
             _sortPhotos : function (places) {

                $.each(places, function (index, place) {
                   place.sortPhotos();
                });

                return places;
             }
          });
       });