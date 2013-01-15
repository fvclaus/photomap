/*jslint */
/*global $, main, UIPanel, UICursor, UITools, UIState */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class UI is a wrapper class for everything which is visible for the user
 * @requires UIPanel, UICursor, UITools
 */

var UI;

UI = function () {

   this.panel = new UIPanel();
   this.cursor = new UICursor();
   this.tools = new UITools();
};

UI.prototype = {

   init : function () {
      this.panel.initWithoutAjax();
      this.cursor.initWithoutAjax();
      main.getUI().getTools().centerElement($(".mp-page-title"), $(".mp-page-title h1"), "vertical");
   },
   getPanel : function () {
      return this.panel;
   },
   getCursor : function () {
      return this.cursor;
   },
   getTools : function () {
      return this.tools;
   }
};