/*jslint */
/*global define, Tools, preinit, init, initializeTest, window */

"use strict";


/**
 * @author Frederik Claus
 * @class Starts the application. Retrieves all objects from server and intialises the rest afterwards. The constructor must be called after dom is ready.
 */

define(["dojo/_base/declare", "ui/UI", "view/MapView", "util/ClientServer", "util/ClientState", "util/Communicator", "util/DataProcessor", "util/Tools"],
       function (declare, ui, MapView, ClientServer, clientState, communicator, dataProcessor, tools) {

          return declare(null , {
             
             constructor : function (args) {

                this.clientState =  clientState;
                // instance of Map
                this.clientServer = new ClientServer();
                this.communicator = communicator;
                this.dataProcessor = dataProcessor;
                // instance of Menu
                this.ui = ui;
                this.tools = tools;
             },
   
             init : function () {
                this.map = new MapView();
             },
             getUIState : function () {
                return this.getUI().getState();
             },
             getClientState : function () {
                return this.clientState;
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
                return this.communicator;
             },
             getDataProcessor : function () {
                return this.dataProcessor;
             },
             getTools : function () {
                return this.tools;
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