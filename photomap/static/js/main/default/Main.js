/*jslint */
/*global $, UI, init, window */

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
   },
   getUI : function () {
      return this.ui;
   }
};