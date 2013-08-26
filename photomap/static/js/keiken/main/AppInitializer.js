/*jslint */
/*global $, define, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class inits the app and fetches the initial data from the server.
 */

define([
   "dojo/_base/declare",
   "./Main",
   "./AppController",
   "./AppModelController",
   "../util/Communicator",
   "../ui/UIState",
   "../model/Album",
   "../util/InfoText"
],
   function (declare, main, AppController, AppModelController, communicator, state, Album, InfoText) {
      return declare(null, {
         
         start : function () {
            console.log("AppInitializer started");
            assertTrue(state.isAlbumView() || state.isDashboardView(), "current view has to be either albumview or dashboardview");
            
            var appController = new AppController(),
                appModelController = new AppModelController();
            
            // do some page specific stuff
            if (window && window.init) {
               init();
            }
            communicator.subscribeOnce("init", this._finalizeInit, this);
            if (state.isAlbumView()) {
               this._getPlaces();
            } else {
               this._getAlbums();
            }
         },
         _finalizeInit : function () {
            // finalize page specific initialization if needed
            if (window && window.finalizeInit) {
               finalizeInit();
            }
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
                instance = this,
                info = new InfoText();
            // get the albums and their info
            $.ajax({
               type: "GET",
               "url" : url,
               success :  function (data) {
                  
                  //TODO "get-all-albums" does not return a data.success or data.error
                  if ((data && data.success) || (data && !data.success)) {
                     instance._processInitialData(data);
                  } else {
                     info.alert(gettext("GET_ALBUM_ERROR") + data.error);
                  }
               },
               error : function () {
                  info.alert(gettext("NETWORK_ERROR"));
               }
            });
         },
         _processInitialData : function (data) {
            assertTrue(state.isAlbumView() || state.isDashboardView(), "current view has to be either albumview or dashboardview");
            
            var processedData;
            
            if (state.isAlbumView()) {
               processedData = new Album(data);
            } else if (state.isDashboardView()) {
               processedData = [];
               
               $.each(data, function (index, albumData) {
                  processedData.push(new Album(albumData));
               });
            }
            console.dir(processedData);
            communicator.publish("init", processedData);
         }
      });
   });