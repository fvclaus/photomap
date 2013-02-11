/*jslint */
/*global ClientState, ClientServer, UI, UIMap , initializeNonInteractive, initialize, initializeAfterAjax, initializeTest, initializePanels */

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

      this.map = new UIMap();
      this.map.initWithoutAjax();
      // load markers on map
      this.clientServer.init();
      // initialise parts of UI that don't need the data loaded from the server
      this.ui.initWithoutAjax();

      // do some page specific stuff
      if (typeof initialize === "function") {
         initialize();
      }

   },
   initAfterAjax: function () {
      this.map.initAfterAjax();
      this.ui.initAfterAjax();
      this.clientState.initAfterAjax();
      if (window && window.initializePanels) {
         initializePanels();
      }
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
   }
};

