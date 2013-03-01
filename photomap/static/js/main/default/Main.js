/*jslint */
/*global $, UI, init, initialize, window */

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
      if (window && window.init) {
         init();
      }
      if (window && window.initialize) {
         initialize();
      }
   },
   getUI : function () {
      return this.ui;
   }
};