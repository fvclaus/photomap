/*jslint */
/*global $, main, UITools */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class UI is a wrapper class for everything which is visible for the user
 * @requires UITools
 */

var UI;

UI = function () {

   this.tools = new UITools();
};

UI.prototype = {

   init : function () {
      main.getUI().getTools().centerElement($(".mp-page-title"), $(".mp-page-title h1"), "vertical");
   },
   getTools : function () {
      return this.tools;
   }
};