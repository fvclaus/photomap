/*jslint */
/*global $, UI, initialize, initializeNonInteractive */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Starts the application. Has to be called after DOM is ready.
 */

var Main;

Main = function () {

   this.ui = new UI();
};

Main.prototype = {
   init: function () {
      this.ui.init();
      if (window && window.initialize) {
         initialize();
      }
      if (window && window.initializeNonInteractive) {
         initializeNonInteractive();
      }
   },
   getUI : function () {
      return this.ui;
   },
   getUIState : function () {
      return this.getUI().getState();
   }
};