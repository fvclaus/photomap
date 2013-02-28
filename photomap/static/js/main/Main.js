/*jslint */
/*global ClientState, ClientServer, UI, UIMap, preinit, init, initializeTest, window */

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
   
   preinit : function () {

      this.map = new UIMap();
      this.map.preinit();
      // load markers on map
      this.clientServer.preinit();
      // initialise parts of UI that don't need the data loaded from the server
      this.ui.preinit();

      // do some page specific stuff
      if (window && window.preinit) {
         preinit();
      }

   },
   init: function () {
      this.map.init();
      this.ui.init();
      this.clientState.init();

      // do some page specific stuff
      if (window && window.init) {
         init();
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

