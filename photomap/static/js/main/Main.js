/*jslint */
/*global define, Tools, preinit, init, initializeTest, window */

"use strict";


/**
 * @author Frederik Claus
 * @class Initializes main classes.
 */

define([
         "dojo/_base/declare",
         "ui/UI",
         "view/MapView",
         "util/ClientServer",
         "util/ClientState",
         "util/Communicator",
         "util/DataProcessor",
         "util/Tools",
         "main/AppController"
       ],
       function (declare, ui, MapView, ClientServer, clientState, communicator, dataProcessor, tools, AppController) {

          return declare(null , {
             
             constructor : function (args) {

                this.clientState = clientState;
                // instance of Map
                this.clientServer = new ClientServer();
                this.communicator = communicator;
                this.dataProcessor = dataProcessor;
                // instance of Menu
                this.ui = ui;
                this.tools = tools;
                this.appController = new AppController();
             },
   
             init : function () {
                this.map = new MapView();
             },
             getUIState : function () {
                throw new Error("DoNotUseThisError");
             },
             getClientState : function () {
                throw new Error("DoNotUseThisError");
             },
             getClientServer : function () {
                return this.clientServer;
             },
             getMap : function () {
                return this.map;
             },
             getUI : function () {
                return this.ui;
             },
             getCommunicator : function () {
                throw new Error("DoNotUseThisError");
             },
             getDataProcessor : function () {
                throw new Error("DoNotUseThisError");
             },
             getTools : function () {
                throw new Error("DoNotUseThisError");
             }
          //    //TODO events?
          //    preinit : function () {

          //       this.map.preinit();
          //       // load markers on map
          //       this.clientServer.preinit();
          //       // initialise parts of UI that don't need the data loaded from the server
          //       this.ui.preinit();

          //       // do some page specific stuff
          //       if (window && window.preinit) {
          //          preinit();
          //       }
          //    },
          //    //TODO events?
          //    init: function () {
          //       this.map.init();
          //       this.ui.init();
          //       this.clientState.init();

          //       // do some page specific stuff
          //       if (window && window.init) {
          //          init();
          //       }
          //       //initialize test, if they are present
          //       if (window && window.initializeTest) {
          //          initializeTest();
          //       }
          //    },
          //    getUIState : function () {
          //       return this.getUI().getState();
          //    },
          //    getClientState : function () {
          //       return this.clientState;
          //    },
          //    getClientServer : function () {
          //       return this.clientServer;
          //    },
          //    getMap : function () {
          //       return this.map;
          //    },
          //    getUI : function () {
          //       return this.ui;
          //    }
          // });
          });

       });