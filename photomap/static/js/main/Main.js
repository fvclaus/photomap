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
             //TODO This shouldn't be used as UIState is a singleton and should be accessed in a static way (@ui-tests.js!)
             getUIState : function () {
                return this.ui.getState();
                //throw new Error("DoNotUseThisError");
             }, 
              //TODO This shouldn't be used as UIState is a singleton and should be accessed in a static way (@ui-tests.js!)
             getClientState : function () {
                return this.clientstate;
                //throw new Error("DoNotUseThisError");
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
             //TODO This shouldn't be used as UIState is a singleton and should be accessed in a static way
             getCommunicator : function () {
                return this.communicator;
                //throw new Error("DoNotUseThisError");
             },
             getDataProcessor : function () {
                throw new Error("DoNotUseThisError");
             },
             getTools : function () {
                throw new Error("DoNotUseThisError");
             }
          });

       });