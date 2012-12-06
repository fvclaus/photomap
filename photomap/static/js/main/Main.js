/*jslint */
/*global ClientState, ClientServer, UI, Map , initializeNonInteractive, initialize, initializeAfterAjax, initializeTest */

"use strict";


/**
 * @author Frederik Claus
 * @class Starts the application. Retrieves all objects from server and intialises the rest afterwards. The constructor must be called after dom is ready.
 */

var Main;

Main = function () {

   this.clientState =  new ClientState();
   // instance of Map
   this.clientServer = new ClientServer();
   // instance of Menu
   this.ui = new UI();
   this.map = null;

};

Main.prototype = {
   initWithoutAjax : function () {
      this.map = new Map();
      this.map.initWithoutAjax();
      // load markers on map
      this.clientServer.init();
      // initialise parts of UI that don't need the data loaded from the server
      this.ui.initWithoutAjax();
      // initialize non-interactive content if needed
      if (!this.getUIState().isInteractive()) {
         initializeNonInteractive();
      }
      // do some page specific stuff
      if (window && window.initialize) {
         initialize();
      }
   },
   initAfterAjax: function () {
      this.map.initAfterAjax();
      this.ui.initAfterAjax();
      // do some page specific stuff
      if (window && window.initializeAfterAjax) {
         initializeAfterAjax();
      }
      //initialize test, if they are present
      if (window && window.initializeTest) {
         initializeTest();
      }
   },
   getUIState : function () {
      return this.ui.getState();
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
   }
};

